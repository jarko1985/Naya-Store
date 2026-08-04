'use server';

import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { addressSchema } from '../validators';
import { formatError } from '../utils';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
}

export async function listAddresses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createAddress(
  data: z.infer<typeof addressSchema> & { isDefault?: boolean }
) {
  try {
    const userId = await requireUserId();
    const { isDefault: requestedDefault, ...rest } = data;
    const address = addressSchema.parse(rest);

    const existingCount = await prisma.address.count({ where: { userId } });
    const makeDefault = existingCount === 0 || requestedDefault === true;

    await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      await tx.address.create({
        data: { ...address, userId, isDefault: makeDefault },
      });
    });

    revalidatePath('/user/addresses');
    revalidatePath('/shipping-address');

    return { success: true, message: 'Address added' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateAddress(
  id: string,
  data: z.infer<typeof addressSchema> & { isDefault?: boolean }
) {
  try {
    const userId = await requireUserId();
    const existing = await prisma.address.findFirst({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, message: 'Address not found' };
    }

    const { isDefault: requestedDefault, ...rest } = data;
    const address = addressSchema.parse(rest);

    await prisma.$transaction(async (tx) => {
      if (requestedDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      await tx.address.update({
        where: { id },
        data: { ...address, ...(requestedDefault ? { isDefault: true } : {}) },
      });
    });

    revalidatePath('/user/addresses');
    revalidatePath('/shipping-address');

    return { success: true, message: 'Address updated' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteAddress(id: string) {
  try {
    const userId = await requireUserId();
    const existing = await prisma.address.findFirst({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, message: 'Address not found' };
    }

    await prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    revalidatePath('/user/addresses');
    revalidatePath('/shipping-address');

    return { success: true, message: 'Address deleted' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const userId = await requireUserId();
    const existing = await prisma.address.findFirst({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, message: 'Address not found' };
    }

    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    revalidatePath('/user/addresses');
    revalidatePath('/shipping-address');

    return { success: true, message: 'Default address updated' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
