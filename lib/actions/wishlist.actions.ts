'use server';

import { z } from 'zod';
import { wishlistItemSchema } from '../validators';
import { formatError, convertToPlainObject } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

// Add or remove a product (optionally a specific variant) from the current user's wishlist
export async function toggleWishlistItem(
  data: z.infer<typeof wishlistItemSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const { productId, variantId } = wishlistItemSchema.parse(data);
    const userId = session.user!.id as string;

    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId, variantId: variantId ?? null },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlist.create({
        data: { userId, productId, variantId: variantId ?? null },
      });
    }

    revalidatePath('/wishlist');

    return {
      success: true,
      wishlisted: !existing,
      message: existing ? 'Removed from wishlist' : 'Added to wishlist',
    };
  } catch (error) {
    return { success: false, wishlisted: false, message: formatError(error) };
  }
}

// Whether the current user has wishlisted a product/variant — returns false for guests
export async function isProductWishlisted({
  productId,
  variantId,
}: {
  productId: string;
  variantId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const existing = await prisma.wishlist.findFirst({
    where: { userId: session.user.id as string, productId, variantId: variantId ?? null },
    select: { id: true },
  });

  return !!existing;
}

// Full wishlist for the current user
export async function getWishlist() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const data = await prisma.wishlist.findMany({
    where: { userId: session.user.id as string },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  return convertToPlainObject(data);
}

// Count of wishlisted items for the current user (e.g. header badge)
export async function getWishlistCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.wishlist.count({ where: { userId: session.user.id as string } });
}
