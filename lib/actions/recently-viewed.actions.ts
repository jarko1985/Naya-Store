'use server';

import { formatError, convertToPlainObject } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { RECENTLY_VIEWED_LIMIT } from '../constants';

// Record that the current signed-in user viewed a product (no-op for guests)
export async function recordProductView(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: true };

    const userId = session.user.id as string;

    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId, productId } },
      update: { viewedAt: new Date() },
      create: { userId, productId },
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Most-recently-viewed products for the current user, excluding one product (e.g. the one being viewed)
export async function getRecentlyViewed(excludeProductId?: string, limit = RECENTLY_VIEWED_LIMIT) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const data = await prisma.recentlyViewed.findMany({
    where: {
      userId: session.user.id as string,
      ...(excludeProductId ? { productId: { not: excludeProductId } } : {}),
    },
    include: { product: true },
    orderBy: { viewedAt: 'desc' },
    take: limit,
  });

  return convertToPlainObject(data);
}
