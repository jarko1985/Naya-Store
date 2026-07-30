'use server';

import { z } from 'zod';
import { couponCodeSchema, insertCouponSchema, updateCouponSchema } from '../validators';
import { formatError, convertToPlainObject, round2 } from '../utils';
import { requireAdmin } from '../auth-guard';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { getMyCart } from './cart.actions';
import { calcPrice } from '../cart-pricing';
import { Coupon } from '@/types';

// Resolves a coupon code against a cart subtotal, applying all validity checks.
// Shared by the cart-page preview, cart application, and order-creation re-validation.
export async function resolveCouponDiscount(code: string, subtotal: number) {
  const normalizedCode = code.trim().toUpperCase();

  const coupon = await prisma.coupon.findFirst({ where: { code: normalizedCode } });

  if (!coupon) return { valid: false as const, message: 'Invalid promo code' };
  if (!coupon.isActive) return { valid: false as const, message: 'This promo code is no longer active' };

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    return { valid: false as const, message: 'This promo code is not active yet' };
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    return { valid: false as const, message: 'This promo code has expired' };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false as const, message: 'This promo code has reached its usage limit' };
  }
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return {
      valid: false as const,
      message: `This promo code requires a minimum order of $${Number(coupon.minOrderValue).toFixed(2)}`,
    };
  }

  const discountAmount = round2(
    coupon.type === 'percent' ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value)
  );

  return { valid: true as const, coupon, discountAmount: Math.min(discountAmount, subtotal) };
}

// Read-only preview used by the cart page's promo field before actually applying it
export async function validateCoupon(data: z.infer<typeof couponCodeSchema>) {
  try {
    const { code } = couponCodeSchema.parse(data);
    const cart = await getMyCart();
    if (!cart) throw new Error('Your cart is empty');

    const result = await resolveCouponDiscount(code, Number(cart.itemsPrice));
    if (!result.valid) return { success: false, message: result.message };

    return {
      success: true,
      discountAmount: result.discountAmount,
      message: `Promo code applied: -$${result.discountAmount.toFixed(2)}`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Applies a coupon to the current user's cart, persisting the discount
export async function applyCouponToCart(data: z.infer<typeof couponCodeSchema>) {
  try {
    const { code } = couponCodeSchema.parse(data);
    const cart = await getMyCart();
    if (!cart) throw new Error('Your cart is empty');

    const result = await resolveCouponDiscount(code, Number(cart.itemsPrice));
    if (!result.valid) return { success: false, message: result.message };

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: result.coupon.code,
        ...calcPrice(cart.items, result.discountAmount),
      },
    });

    revalidatePath('/cart');

    return { success: true, message: `Promo code applied: -$${result.discountAmount.toFixed(2)}` };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Removes any coupon from the current user's cart
export async function removeCouponFromCart() {
  try {
    const cart = await getMyCart();
    if (!cart) throw new Error('Your cart is empty');

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: null,
        ...calcPrice(cart.items, 0),
      },
    });

    revalidatePath('/cart');

    return { success: true, message: 'Promo code removed' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ── Admin coupon CRUD ──

export async function getAllCoupons(): Promise<Coupon[]> {
  await requireAdmin();
  const data = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return convertToPlainObject(data) as unknown as Coupon[];
}

export async function createCoupon(data: z.infer<typeof insertCouponSchema>) {
  try {
    await requireAdmin();
    const coupon = insertCouponSchema.parse(data);

    await prisma.coupon.create({
      data: {
        code: coupon.code.trim().toUpperCase(),
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue ?? null,
        maxUses: coupon.maxUses ?? null,
        startsAt: coupon.startsAt ? new Date(coupon.startsAt) : null,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : null,
        isActive: coupon.isActive,
      },
    });

    revalidatePath('/admin/coupons');

    return { success: true, message: 'Coupon created successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateCoupon(data: z.infer<typeof updateCouponSchema>) {
  try {
    await requireAdmin();
    const coupon = updateCouponSchema.parse(data);

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        code: coupon.code.trim().toUpperCase(),
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue ?? null,
        maxUses: coupon.maxUses ?? null,
        startsAt: coupon.startsAt ? new Date(coupon.startsAt) : null,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : null,
        isActive: coupon.isActive,
      },
    });

    revalidatePath('/admin/coupons');

    return { success: true, message: 'Coupon updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requireAdmin();
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true, message: 'Coupon deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
