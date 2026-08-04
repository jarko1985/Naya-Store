'use server';

import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';
import { insertCategorySchema } from '../validators';
import { formatError } from '../utils';
import z from 'zod';

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  productCount: number;
  children: CategoryNode[];
};

// All categories, nested into a parent/children tree, each with its own product count.
// Queries Category directly (not a groupBy on Product) so a freshly created, still-empty
// subcategory shows up immediately.
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  const nodeById = new Map<string, CategoryNode>(
    categories.map((c) => [
      c.id,
      {
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        parentId: c.parentId,
        productCount: c._count.products,
        children: [],
      },
    ])
  );

  const roots: CategoryNode[] = [];
  for (const node of nodeById.values()) {
    if (node.parentId && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// Flat list (all categories, no nesting) — convenient for <Select> option lists.
export async function getAllCategoriesFlat() {
  return prisma.category.findMany({
    orderBy: [{ parentId: { sort: 'asc', nulls: 'first' } }, { name: 'asc' }],
  });
}

// Collects a category's id plus every descendant id (recursively), so filtering by a
// parent category also matches products assigned to its subcategories.
export async function getCategoryAndDescendantIds(categorySlug: string): Promise<string[]> {
  const root = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!root) return [];

  const ids = [root.id];
  let frontier = [root.id];
  while (frontier.length > 0) {
    const children = await prisma.category.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    if (children.length === 0) break;
    const childIds = children.map((c) => c.id);
    ids.push(...childIds);
    frontier = childIds;
  }

  return ids;
}

export async function createCategory(data: z.infer<typeof insertCategorySchema>) {
  try {
    const parsed = insertCategorySchema.parse(data);
    const name = parsed.name.trim();
    const baseSlug = slugify(name, { lower: true, strict: true });

    let slug = baseSlug;
    let attempt = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    const created = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parsed.parentId || null,
        image: parsed.image || null,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');

    return { success: true, message: 'Category created successfully', id: created.id };
  } catch (error) {
    return { success: false, message: formatError(error), id: undefined };
  }
}

export async function upsertCategoryImage(categoryId: string, image: string) {
  try {
    await prisma.category.update({ where: { id: categoryId }, data: { image } });

    revalidatePath('/admin/categories');
    revalidatePath('/');

    return { success: true, message: 'Category image updated successfully' };
  } catch {
    return { success: false, message: 'Failed to update category image' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const [productCount, childCount] = await Promise.all([
      prisma.product.count({ where: { categoryId: id } }),
      prisma.category.count({ where: { parentId: id } }),
    ]);

    if (productCount > 0) {
      throw new Error('Cannot delete a category that still has products assigned to it');
    }
    if (childCount > 0) {
      throw new Error('Cannot delete a category that still has subcategories');
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath('/admin/categories');
    revalidatePath('/');

    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
