'use server';

import { prisma } from '@/db/prisma';
import { requireAdmin } from '../auth-guard';
import { shipmentUpdateSchema } from '../validators';
import { formatError } from '../utils';
import { SHIPMENT_STATUS_RANK, ShipmentStatus } from '../constants';
import { sendShipmentUpdateEmail } from '@/email';
import { revalidatePath } from 'next/cache';

export async function updateShipmentStatus({
  orderId,
  status,
  carrier,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
}) {
  try {
    await requireAdmin();

    const validated = shipmentUpdateSchema.parse({ status, carrier, trackingNumber });
    const nextStatus = validated.status as ShipmentStatus;

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { shipment: true, user: { select: { email: true } } },
    });

    if (!order || !order.shipment) throw new Error('Order not found');

    if (!order.isPaid && nextStatus !== 'pending') {
      throw new Error('Order must be paid before updating shipment status');
    }

    const currentRank = SHIPMENT_STATUS_RANK[order.shipment.status as ShipmentStatus];
    const nextRank = SHIPMENT_STATUS_RANK[nextStatus];

    if (nextRank < currentRank) {
      throw new Error('Shipment status cannot move backwards');
    }

    const now = new Date();
    const timestampUpdates: { shippedAt?: Date; outForDeliveryAt?: Date; deliveredAt?: Date } = {};
    // Backfill any intermediate stage skipped over by a forward jump (e.g.
    // pending straight to delivered), so the timeline never shows a gap.
    if (nextRank >= 1 && !order.shipment.shippedAt) timestampUpdates.shippedAt = now;
    if (nextRank >= 2 && !order.shipment.outForDeliveryAt) timestampUpdates.outForDeliveryAt = now;
    if (nextRank >= 3 && !order.shipment.deliveredAt) timestampUpdates.deliveredAt = now;

    await prisma.shipment.update({
      where: { id: order.shipment.id },
      data: {
        status: nextStatus,
        carrier: validated.carrier || null,
        trackingNumber: validated.trackingNumber || null,
        ...timestampUpdates,
      },
    });

    // Only notify on a genuine forward transition, not a resubmit that just
    // updates carrier/tracking with the same status.
    if (nextRank > currentRank && nextStatus !== 'pending') {
      try {
        await sendShipmentUpdateEmail({
          orderId: order.id,
          email: order.user.email,
          status: nextStatus,
          carrier: validated.carrier,
          trackingNumber: validated.trackingNumber,
        });
      } catch (emailError) {
        console.error('Failed to send shipment update email:', emailError);
      }
    }

    revalidatePath(`/order/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/user/orders');

    return { success: true, message: 'Shipment updated' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
