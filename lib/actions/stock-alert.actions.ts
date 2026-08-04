'use server';

import { z } from 'zod';
import { stockAlertSchema } from '../validators';
import { formatError } from '../utils';
import { prisma } from '@/db/prisma';
import { sendBackInStockAlert } from '@/email';

// Sign up an email for a back-in-stock alert on a product (public, no auth required)
export async function subscribeToStockAlert(
  data: z.infer<typeof stockAlertSchema>
) {
  try {
    const { email, productId } = stockAlertSchema.parse(data);
    const normalizedEmail = email.trim().toLowerCase();

    const product = await prisma.product.findFirst({
      where: { id: productId },
      include: { variants: true },
    });
    if (!product) throw new Error('Product not found');

    const effectiveStock =
      product.variants.length > 0
        ? product.variants.reduce((sum, v) => sum + v.stock, 0)
        : product.stock;

    if (effectiveStock > 0) {
      return { success: false, message: 'This item is currently in stock' };
    }

    const existing = await prisma.stockAlert.findFirst({
      where: { email: normalizedEmail, productId },
    });

    if (existing) {
      return {
        success: true,
        message: "You're already signed up for an alert on this item",
      };
    }

    await prisma.stockAlert.create({
      data: { email: normalizedEmail, productId },
    });

    return {
      success: true,
      message: "We'll email you when this item is back in stock",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Notify everyone who signed up for an alert that a product is back in stock,
// then clear the alerts that were successfully sent (one-shot notification)
export async function notifyBackInStock(productId: string) {
  const alerts = await prisma.stockAlert.findMany({ where: { productId } });
  if (alerts.length === 0) return;

  const product = await prisma.product.findFirst({ where: { id: productId } });
  if (!product) return;

  const emailProduct = {
    name: product.name,
    slug: product.slug,
    images: product.images,
    price: product.price.toString(),
  };

  const sentIds: string[] = [];
  for (const alert of alerts) {
    try {
      await sendBackInStockAlert({ email: alert.email, product: emailProduct });
      sentIds.push(alert.id);
    } catch {
      // Leave the alert in place so it can be retried on the next restock
    }
  }

  if (sentIds.length > 0) {
    await prisma.stockAlert.deleteMany({ where: { id: { in: sentIds } } });
  }
}
