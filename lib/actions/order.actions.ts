'use server';

import { convertToPlainObject, formatError, convert, getCurrencyDecimals } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { calcPrice } from '../cart-pricing';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { resolveCouponDiscount } from './coupon.actions';
import { prisma } from '@/db/prisma';
import { PAGE_SIZE, STRIPE_SUPPORTED_CURRENCIES, PAYPAL_SUPPORTED_CURRENCIES } from '../constants';
import { CartItem, PaymentResult, ShippingAddress } from '@/types';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { sendPurchaseReceipt } from '@/email';
import { getActiveCurrency, getExchangeRates } from '../currency';

export async function createOrder() {
    try {
      const session = await auth();
      if (!session) throw new Error('User is not authenticated');
  
      const cart = await getMyCart();
      const userId = session?.user?.id;
      if (!userId) throw new Error('User not found');
  
      const user = await getUserById(userId);
  
      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          message: 'Your cart is empty',
          redirectTo: '/cart',
        };
      }
  
      if (!user.address) {
        return {
          success: false,
          message: 'No shipping address',
          redirectTo: '/shipping-address',
        };
      }
  
      if (!user.paymentMethod) {
        return {
          success: false,
          message: 'No payment method',
          redirectTo: '/payment-method',
        };
      }

      // Re-validate any coupon applied to the cart — it may have expired, been
      // deactivated, or hit its usage limit since it was applied
      let validatedCoupon: Awaited<ReturnType<typeof resolveCouponDiscount>> | null = null;
      if (cart.couponCode) {
        validatedCoupon = await resolveCouponDiscount(cart.couponCode, Number(cart.itemsPrice));

        if (!validatedCoupon.valid) {
          // Clear the stale coupon from the cart so the user isn't stuck retrying it
          await prisma.cart.update({
            where: { id: cart.id },
            data: { couponCode: null, discountAmount: 0, totalPrice: Number(cart.itemsPrice) + Number(cart.taxPrice) + Number(cart.shippingPrice) },
          });

          return {
            success: false,
            message: validatedCoupon.message + ' — it has been removed from your cart',
            redirectTo: '/cart',
          };
        }
      }

      const discountAmount = validatedCoupon?.valid ? validatedCoupon.discountAmount : 0;

      // Recompute pricing fresh from the cart's items so itemsPrice/shippingPrice/
      // taxPrice/totalPrice are always internally consistent with the just-revalidated
      // discount (cart.totalPrice may be stale if it was computed before this re-check)
      const freshPricing = calcPrice(cart.items, discountAmount);

      // Freeze the USD->currency conversion at order-creation time: cart
      // amounts are always USD at rest, but the Order itself becomes a
      // self-consistent snapshot in the buyer's active currency, and this
      // exact converted total is what Stripe/PayPal actually charge — never
      // a live rate recomputed later.
      const activeCurrency = await getActiveCurrency();
      const rates = await getExchangeRates();
      const exchangeRate = rates[activeCurrency] ?? 1;
      const decimals = getCurrencyDecimals(activeCurrency);
      const toOrderCurrency = (usdAmount: number | string) =>
        convert(Number(usdAmount), exchangeRate, activeCurrency).toFixed(decimals);

      // Defense in depth: the payment-method UI already hides providers that
      // can't charge the active currency, but re-check server-side too since
      // paymentMethod/currency could otherwise disagree (e.g. currency
      // switched after the payment method was saved).
      if (user.paymentMethod === 'Stripe' && !STRIPE_SUPPORTED_CURRENCIES.includes(activeCurrency)) {
        return {
          success: false,
          message: `Stripe can't charge in ${activeCurrency}. Choose a different currency or payment method.`,
          redirectTo: '/payment-method',
        };
      }
      if (user.paymentMethod === 'PayPal' && !PAYPAL_SUPPORTED_CURRENCIES.includes(activeCurrency)) {
        return {
          success: false,
          message: `PayPal can't charge in ${activeCurrency}. Choose a different currency or payment method.`,
          redirectTo: '/payment-method',
        };
      }

      // Create order object
      const order = insertOrderSchema.parse({
        userId: user.id,
        shippingAddress: user.address,
        paymentMethod: user.paymentMethod,
        itemsPrice: toOrderCurrency(freshPricing.itemsPrice),
        shippingPrice: toOrderCurrency(freshPricing.shippingPrice),
        taxPrice: toOrderCurrency(freshPricing.taxPrice),
        totalPrice: toOrderCurrency(freshPricing.totalPrice),
        currency: activeCurrency,
        exchangeRate,
      });

      // Create a transaction to create order and order items in database
      const insertedOrderId = await prisma.$transaction(async (tx) => {
        // Create order
        const insertedOrder = await tx.order.create({
          data: {
            ...order,
            couponCode: validatedCoupon?.valid ? validatedCoupon.coupon.code : null,
            discountAmount: toOrderCurrency(discountAmount),
          },
        });

        // Atomically record the coupon redemption alongside order creation
        if (validatedCoupon?.valid) {
          await tx.coupon.update({
            where: { id: validatedCoupon.coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        // Create order items from the cart items
        for (const item of cart.items as CartItem[]) {
          await tx.orderItem.create({
            data: {
              orderId: insertedOrder.id,
              productId: item.productId,
              name: item.name,
              slug: item.slug,
              qty: item.qty,
              image: item.image,
              price: toOrderCurrency(item.price),
              variantId: item.variantId ?? null,
              color: item.color ?? null,
              size: item.size ?? null,
            },
          });
        }
        // Clear cart
        await tx.cart.update({
          where: { id: cart.id },
          data: {
            items: [],
            totalPrice: 0,
            taxPrice: 0,
            shippingPrice: 0,
            itemsPrice: 0,
            couponCode: null,
            discountAmount: 0,
          },
        });
  
        return insertedOrder.id;
      });
  
      if (!insertedOrderId) throw new Error('Order not created');
  
      return {
        success: true,
        message: 'Order created',
        redirectTo: `/order/${insertedOrderId}?new=1`,
      };
    } catch (error) {
      if (isRedirectError(error)) throw error;
      return { success: false, message: formatError(error) };
    }
  }

  export async function getOrderById(orderId: string) {
    const data = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderitems: true,
        user: { select: { name: true, email: true } },
      },
    });
  
    return convertToPlainObject(data);
  }
  export async function createPayPalOrder(orderId: string) {
    try {
      // Get order from database
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
        },
      });
  
      if (order) {
        // Create paypal order
        const paypalOrder = await paypal.createOrder(Number(order.totalPrice), order.currency);
  
        // Update order with paypal order id
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentResult: {
              id: paypalOrder.id,
              email_address: '',
              status: '',
              pricePaid: 0,
            },
          },
        });
  
        return {
          success: true,
          message: 'Item order created successfully',
          data: paypalOrder.id,
        };
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
  export async function approvePayPalOrder(
    orderId: string,
    data: { orderID: string }
  ) {
    try {
      // Get order from database
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
        },
      });
  
      if (!order) throw new Error('Order not found');
  
      const captureData = await paypal.capturePayment(data.orderID);
  
      if (
        !captureData ||
        captureData.id !== (order.paymentResult as PaymentResult)?.id ||
        captureData.status !== 'COMPLETED'
      ) {
        throw new Error('Error in PayPal payment');
      }
  
      // Update order to paid
      await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: captureData.id,
          status: captureData.status,
          email_address: captureData.payer.email_address,
          pricePaid:
            captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
        },
      });
  
      revalidatePath(`/order/${orderId}`);
  
      return {
        success: true,
        message: 'Your order has been paid',
      };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
  export async function updateOrderToPaid({
    orderId,
    paymentResult,
  }: {
    orderId: string;
    paymentResult?: PaymentResult;
  }) {
    // Get order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderitems: true,
      },
    });
  
    if (!order) throw new Error('Order not found');
  
    if (order.isPaid) throw new Error('Order is already paid');
  
    // Transaction to update order and account for product stock
    await prisma.$transaction(async (tx) => {
      // Iterate over products and update stock
      for (const item of order.orderitems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: -item.qty } },
        });
      }
  
      // Set the order to paid
      await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult,
        },
      });
    });
  
    // Get updated order after transaction
    const updatedOrder = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderitems: true,
        user: { select: { name: true, email: true } },
      },
    });
  
    if (!updatedOrder) throw new Error('Order not found');
  
    sendPurchaseReceipt({
      order: {
        ...updatedOrder,
        itemsPrice: updatedOrder.itemsPrice.toString(),
        shippingPrice: updatedOrder.shippingPrice.toString(),
        taxPrice: updatedOrder.taxPrice.toString(),
        totalPrice: updatedOrder.totalPrice.toString(),
        discountAmount: updatedOrder.discountAmount.toString(),
        exchangeRate: Number(updatedOrder.exchangeRate),
        shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
        paymentResult: updatedOrder.paymentResult as PaymentResult,
      },
    });
  }
  export async function updateOrderToPaidCOD(orderId: string) {
    try {
      await updateOrderToPaid({ orderId });
  
      revalidatePath(`/order/${orderId}`);
  
      return { success: true, message: 'Order marked as paid' };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
  export async function deliverOrder(orderId: string) {
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
        },
      });
  
      if (!order) throw new Error('Order not found');
      if (!order.isPaid) throw new Error('Order is not paid');
  
      await prisma.order.update({
        where: { id: orderId },
        data: {
          isDelivered: true,
          deliveredAt: new Date(),
        },
      });
  
      revalidatePath(`/order/${orderId}`);
  
      return {
        success: true,
        message: 'Order has been marked delivered',
      };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
  export async function getMyOrders({
    limit = PAGE_SIZE,
    page,
  }: {
    limit?: number;
    page: number;
  }) {
    const session = await auth();
    if (!session) throw new Error('User is not authorized');
  
    const data = await prisma.order.findMany({
      where: { userId: session?.user?.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });
  
    const dataCount = await prisma.order.count({
      where: { userId: session?.user?.id },
    });
  
    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  }
  
type SalesDataType = {
  month: string;
  totalSales: number;
}[];
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales. Orders can be placed in different
  // currencies (Sprint 5), so each order's totalPrice is normalized back to
  // USD via its own frozen exchangeRate (USD -> order.currency) before
  // summing — a raw sum across currencies would be meaningless.
  const totalSalesRaw = await prisma.$queryRaw<
    Array<{ totalSalesUsd: Prisma.Decimal | null }>
  >`SELECT sum("totalPrice" / "exchangeRate") as "totalSalesUsd" FROM "Order"`;
  const totalSales = { _sum: { totalPrice: totalSalesRaw[0]?.totalSalesUsd ?? null } };

  // Get monthly sales (also USD-normalized, same reasoning as above)
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice" / "exchangeRate") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== 'all'
      ? {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
