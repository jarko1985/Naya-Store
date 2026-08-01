'use server';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema, insertProductVariantSchema, updateProductVariantSchema } from "../validators";
import z from "zod";
export async function getLatestProducts () {
    const data = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: LATEST_PRODUCTS_LIMIT
    });
    return convertToPlainObject(data);
}
export async function getProductBySlug(slug: string) {
    const data = await prisma.product.findFirst({
      where: { slug },
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });
    return convertToPlainObject(data);
  }
  export async function getProductById(productId: string) {
    const data = await prisma.product.findFirst({
      where: { id: productId },
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });

    return convertToPlainObject(data);
  }  
  export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort,
  }: {
    query: string;
    limit?: number;
    page: number;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
  }) {
    // Query filter
    const queryFilter: Prisma.ProductWhereInput =
      query && query !== 'all'
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          }
        : {};
  
    // Category filter
    const categoryFilter = category && category !== 'all' ? { category } : {};
  
    // Price filter
    const priceFilter: Prisma.ProductWhereInput =
      price && price !== 'all'
        ? {
            price: {
              gte: Number(price.split('-')[0]),
              lte: Number(price.split('-')[1]),
            },
          }
        : {};
  
    // Rating filter
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              gte: Number(rating),
            },
          }
        : {};
  
    const data = await prisma.product.findMany({
      where: {
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
      },
      orderBy:
        sort === 'lowest'
          ? { price: 'asc' }
          : sort === 'highest'
          ? { price: 'desc' }
          : sort === 'rating'
          ? { rating: 'desc' }
          : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  
    const dataCount = await prisma.product.count();

    return {
      data: convertToPlainObject(data),
      totalPages: Math.ceil(dataCount / limit),
    };
  }
  export async function deleteProduct(id: string) {
    try {
      const productExists = await prisma.product.findFirst({
        where: { id },
      });
  
      if (!productExists) throw new Error('Product not found');
  
      await prisma.product.delete({ where: { id } });
  
      revalidatePath('/admin/products');
  
      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
  export async function createProduct(data: z.infer<typeof insertProductSchema>) {
    try {
      const product = insertProductSchema.parse(data);
      const created = await prisma.product.create({
        data: { ...product, compareAtPrice: product.compareAtPrice || null },
      });

      revalidatePath('/admin/products');

      return {
        success: true,
        message: 'Product created successfully',
        id: created.id,
      };
    } catch (error) {
      return { success: false, message: formatError(error), id: undefined };
    }
  }

  // Update a product
  export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
    try {
      const product = updateProductSchema.parse(data);
      const productExists = await prisma.product.findFirst({
        where: { id: product.id },
      });

      if (!productExists) throw new Error('Product not found');

      await prisma.product.update({
        where: { id: product.id },
        data: { ...product, compareAtPrice: product.compareAtPrice || null },
      });

      revalidatePath('/admin/products');

      return {
        success: true,
        message: 'Product updated successfully',
      };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
  
  // Get all categories
  export async function getAllCategories() {
    const data = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
    });
  
    return data;
  }
  
  // Get featured products
  export async function getFeaturedProducts() {
    const data = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    return convertToPlainObject(data);
  }

  // Get products currently marked down (compareAtPrice > price)
  export async function getOnSaleProducts(limit = 8) {
    const candidates = await prisma.product.findMany({
      where: { compareAtPrice: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    const onSale = candidates.filter(
      (p) => p.compareAtPrice !== null && Number(p.compareAtPrice) > Number(p.price)
    );

    return convertToPlainObject(onSale.slice(0, limit));
  }

  // Get top rated products
  export async function getTopRatedProducts() {
    const data = await prisma.product.findMany({
      orderBy: [{ rating: 'desc' }, { numReviews: 'desc' }],
      take: LATEST_PRODUCTS_LIMIT,
    });

    return convertToPlainObject(data);
  }

  // Create a product variant
  export async function createProductVariant(data: z.infer<typeof insertProductVariantSchema>) {
    try {
      const variant = insertProductVariantSchema.parse(data);
      await prisma.productVariant.create({
        data: { ...variant, compareAtPrice: variant.compareAtPrice || null },
      });
      revalidatePath('/admin/products');
      return { success: true, message: 'Variant created successfully' };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }

  // Update a product variant
  export async function updateProductVariant(data: z.infer<typeof updateProductVariantSchema>) {
    try {
      const variant = updateProductVariantSchema.parse(data);
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          color: variant.color,
          size: variant.size,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice || null,
          stock: variant.stock,
          image: variant.image,
        },
      });
      revalidatePath('/admin/products');
      return { success: true, message: 'Variant updated successfully' };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }

  // Delete a product variant
  export async function deleteProductVariant(id: string) {
    try {
      await prisma.productVariant.delete({ where: { id } });
      revalidatePath('/admin/products');
      return { success: true, message: 'Variant deleted successfully' };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }

  // Get products related to a given product (same category, best rated first)
  export async function getRelatedProducts({
    productId,
    category,
    limit = 4,
  }: {
    productId: string;
    category: string;
    limit?: number;
  }) {
    const data = await prisma.product.findMany({
      where: {
        category,
        id: { not: productId },
      },
      orderBy: [{ rating: 'desc' }, { numReviews: 'desc' }],
      take: limit,
    });

    return convertToPlainObject(data);
  }

  // Lightweight product name matches for search autocomplete
  export async function getProductSuggestions(query: string, limit = 5) {
    if (!query || query.trim().length < 2) return [];

    const data = await prisma.product.findMany({
      where: {
        name: { contains: query.trim(), mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        category: true,
      },
      orderBy: { numReviews: 'desc' },
      take: limit,
    });

    return convertToPlainObject(data);
  }

  // Upsell suggestions for the cart page — same categories as items already in cart, excluding those items
  export async function getCartUpsells({
    categories,
    excludeIds,
    limit = 4,
  }: {
    categories: string[];
    excludeIds: string[];
    limit?: number;
  }) {
    if (categories.length === 0) return [];

    const data = await prisma.product.findMany({
      where: {
        category: { in: categories },
        id: { notIn: excludeIds },
      },
      orderBy: [{ rating: 'desc' }, { numReviews: 'desc' }],
      take: limit,
    });

    return convertToPlainObject(data);
  }

  // Fetch multiple products by id, preserving no particular order (used by compare page)
  export async function getProductsByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    const data = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });

    return convertToPlainObject(data);
  }