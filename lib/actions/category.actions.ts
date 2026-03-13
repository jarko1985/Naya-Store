'use server';

import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

export async function getAllCategoryMeta() {
  const data = await prisma.categoryMeta.findMany();
  return data;
}

export async function upsertCategoryImage(name: string, image: string) {
  try {
    await prisma.categoryMeta.upsert({
      where: { name },
      update: { image },
      create: { name, image },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');

    return { success: true, message: 'Category image updated successfully' };
  } catch {
    return { success: false, message: 'Failed to update category image' };
  }
}
