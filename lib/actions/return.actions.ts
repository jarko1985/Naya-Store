'use server';

import { prisma } from '@/db/prisma';
import { auth } from '@/auth';
import { requireAdmin } from '../auth-guard';
import { returnRequestSchema, returnDecisionSchema } from '../validators';
import { convertToPlainObject, formatError, roundToCurrency, toMinorUnits } from '../utils';
import { PAGE_SIZE, RETURN_STATUS_TRANSITIONS, RETURN_WINDOW_DAYS, ReturnStatus } from '../constants';
import { stripe } from '../stripe';
import { paypal } from '../paypal';
import { sendReturnUpdateEmail } from '@/email';
import { PaymentResult, Return } from '@/types';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

function assertTransition(current: string, next: ReturnStatus) {
  const allowed = RETURN_STATUS_TRANSITIONS[current as ReturnStatus];
  if (!allowed?.includes(next)) {
    throw new Error(`Cannot move a return from "${current}" to "${next}"`);
  }
}

export async function requestReturn({
  orderId,
  reason,
  items,
}: {
  orderId: string;
  reason: string;
  items: { orderItemId: string; qty: number }[];
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User is not authenticated');

    const validated = returnRequestSchema.parse({ orderId, reason, items });

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderitems: true,
        shipment: true,
        returns: { include: { items: true } },
        user: { select: { email: true } },
      },
    });

    if (!order || order.userId !== userId) throw new Error('Order not found');

    if (!order.isPaid) throw new Error('Order is not paid');
    if (!order.shipment || order.shipment.status !== 'delivered' || !order.shipment.deliveredAt) {
      throw new Error('This order has not been delivered yet');
    }

    const daysSinceDelivery =
      (Date.now() - new Date(order.shipment.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new Error(`The ${RETURN_WINDOW_DAYS}-day return window for this order has passed`);
    }

    // Sum qty already tied up in a non-rejected return per order item, so a
    // rejected request frees the qty back up but a pending/approved one doesn't.
    const alreadyRequestedByItem = new Map<string, number>();
    for (const ret of order.returns) {
      if (ret.status === 'rejected') continue;
      for (const ri of ret.items) {
        alreadyRequestedByItem.set(
          ri.orderItemId,
          (alreadyRequestedByItem.get(ri.orderItemId) ?? 0) + ri.qty
        );
      }
    }

    for (const reqItem of validated.items) {
      const orderItem = order.orderitems.find((oi) => oi.id === reqItem.orderItemId);
      if (!orderItem) throw new Error('One of the selected items is not part of this order');

      const remaining = orderItem.qty - (alreadyRequestedByItem.get(orderItem.id) ?? 0);
      if (reqItem.qty > remaining) {
        throw new Error(`Only ${remaining} unit(s) of "${orderItem.name}" can still be returned`);
      }
    }

    const newReturnId = await prisma.$transaction(async (tx) => {
      const created = await tx.return.create({
        data: { orderId: order.id, userId, reason: validated.reason, status: 'requested' },
      });

      for (const item of validated.items) {
        await tx.returnItem.create({
          data: { returnId: created.id, orderItemId: item.orderItemId, qty: item.qty },
        });
      }

      return created.id;
    });

    try {
      await sendReturnUpdateEmail({
        returnId: newReturnId,
        orderId: order.id,
        email: order.user.email,
        status: 'requested',
      });
    } catch (emailError) {
      console.error('Failed to send return request confirmation email:', emailError);
    }

    revalidatePath(`/order/${orderId}`);
    revalidatePath('/user/returns');

    return { success: true, message: 'Return request submitted' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getReturnById(id: string) {
  const data = await prisma.return.findFirst({
    where: { id },
    include: {
      items: { include: { orderItem: true } },
      order: { select: { id: true, currency: true, user: { select: { name: true, email: true } } } },
    },
  });

  return convertToPlainObject(data) as unknown as Return | null;
}

export async function listMyReturns({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('User is not authorized');

  const data = await prisma.return.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      items: { include: { orderItem: true } },
      order: { select: { id: true, currency: true, user: { select: { name: true, email: true } } } },
    },
  });

  const dataCount = await prisma.return.count({ where: { userId } });

  return {
    data: convertToPlainObject(data) as unknown as Return[],
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function listAllReturns({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  await requireAdmin();

  const queryFilter: Prisma.ReturnWhereInput =
    query && query !== 'all'
      ? { order: { user: { name: { contains: query, mode: 'insensitive' } } } }
      : {};

  const data = await prisma.return.findMany({
    where: queryFilter,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      items: { include: { orderItem: true } },
      order: { select: { id: true, currency: true, user: { select: { name: true, email: true } } } },
    },
  });

  const dataCount = await prisma.return.count({ where: queryFilter });

  return {
    data: convertToPlainObject(data) as unknown as Return[],
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function approveReturn(returnId: string, adminNote?: string) {
  try {
    await requireAdmin();
    const validated = returnDecisionSchema.parse({ adminNote });

    const ret = await prisma.return.findFirst({
      where: { id: returnId },
      include: { order: { include: { user: { select: { email: true } } } } },
    });
    if (!ret) throw new Error('Return not found');

    assertTransition(ret.status, 'approved');

    await prisma.return.update({
      where: { id: returnId },
      data: { status: 'approved', adminNote: validated.adminNote || null },
    });

    try {
      await sendReturnUpdateEmail({
        returnId: ret.id,
        orderId: ret.orderId,
        email: ret.order.user.email,
        status: 'approved',
      });
    } catch (emailError) {
      console.error('Failed to send return approval email:', emailError);
    }

    revalidatePath(`/admin/returns/${returnId}`);
    revalidatePath('/admin/returns');
    revalidatePath(`/order/${ret.orderId}`);
    revalidatePath('/user/returns');

    return { success: true, message: 'Return approved' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function rejectReturn(returnId: string, adminNote?: string) {
  try {
    await requireAdmin();
    const validated = returnDecisionSchema.parse({ adminNote });

    const ret = await prisma.return.findFirst({
      where: { id: returnId },
      include: { order: { include: { user: { select: { email: true } } } } },
    });
    if (!ret) throw new Error('Return not found');

    assertTransition(ret.status, 'rejected');

    await prisma.return.update({
      where: { id: returnId },
      data: { status: 'rejected', adminNote: validated.adminNote || null },
    });

    try {
      await sendReturnUpdateEmail({
        returnId: ret.id,
        orderId: ret.orderId,
        email: ret.order.user.email,
        status: 'rejected',
      });
    } catch (emailError) {
      console.error('Failed to send return rejection email:', emailError);
    }

    revalidatePath(`/admin/returns/${returnId}`);
    revalidatePath('/admin/returns');
    revalidatePath(`/order/${ret.orderId}`);
    revalidatePath('/user/returns');

    return { success: true, message: 'Return rejected' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function resolveReturn(returnId: string) {
  try {
    await requireAdmin();

    const ret = await prisma.return.findFirst({
      where: { id: returnId },
      include: {
        items: { include: { orderItem: true } },
        order: { include: { user: { select: { email: true } } } },
      },
    });
    if (!ret) throw new Error('Return not found');

    assertTransition(ret.status, 'resolved');

    const refundAmount = roundToCurrency(
      ret.items.reduce((sum, item) => sum + Number(item.orderItem.price) * item.qty, 0),
      ret.order.currency
    );

    const paymentResult = ret.order.paymentResult as PaymentResult | null;

    // Issue the refund before touching any local state. Unlike this codebase's
    // usual "log and continue" pattern for side-channel failures (e.g. the
    // shipment/back-in-stock emails), a refund failure here has to abort the
    // whole action — the refund IS the primary effect the admin asked for, not
    // a side effect, so it must never be silently swallowed.
    if (ret.order.paymentMethod === 'Stripe') {
      if (!paymentResult?.id) throw new Error('Order has no recorded Stripe charge to refund');
      await stripe.refunds.create({
        charge: paymentResult.id,
        amount: toMinorUnits(refundAmount, ret.order.currency),
      });
    } else if (ret.order.paymentMethod === 'PayPal') {
      if (!paymentResult?.id) throw new Error('Order has no recorded PayPal capture to refund');
      await paypal.refundCapture(paymentResult.id, refundAmount, ret.order.currency);
    }
    // CashOnDelivery: nothing was captured electronically — refundAmount is
    // recorded informationally below, with no API call.

    await prisma.$transaction(async (tx) => {
      for (const item of ret.items) {
        if (item.orderItem.variantId) {
          await tx.productVariant.update({
            where: { id: item.orderItem.variantId },
            data: { stock: { increment: item.qty } },
          });
        } else {
          await tx.product.update({
            where: { id: item.orderItem.productId },
            data: { stock: { increment: item.qty } },
          });
        }
      }

      await tx.return.update({
        where: { id: returnId },
        data: { status: 'resolved', refundAmount, refundedAt: new Date() },
      });
    });

    try {
      await sendReturnUpdateEmail({
        returnId: ret.id,
        orderId: ret.orderId,
        email: ret.order.user.email,
        status: 'resolved',
        refundAmount,
        currency: ret.order.currency,
      });
    } catch (emailError) {
      console.error('Failed to send return resolution email:', emailError);
    }

    revalidatePath(`/admin/returns/${returnId}`);
    revalidatePath('/admin/returns');
    revalidatePath(`/order/${ret.orderId}`);
    revalidatePath('/user/returns');

    return { success: true, message: 'Return resolved and refund issued' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
