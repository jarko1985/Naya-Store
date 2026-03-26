'use server';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { Product } from "@/types";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema, insertProductVariantSchema, updateProductVariantSchema } from "../validators";
import z from "zod";
export async function getLatestProducts () {
    const data = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: LATEST_PRODUCTS_LIMIT,
        include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });
    return convertToPlainObject(data) as unknown as Product[];
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
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });
  
    const dataCount = await prisma.product.count();
  
    return {
      data: convertToPlainObject(data) as unknown as Product[],
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
      const created = await prisma.product.create({ data: product });

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
        data: product,
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
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });

    return convertToPlainObject(data) as unknown as Product[];
  }

  // Get top rated products
  export async function getTopRatedProducts() {
    const data = await prisma.product.findMany({
      orderBy: [{ rating: 'desc' }, { numReviews: 'desc' }],
      take: LATEST_PRODUCTS_LIMIT,
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });

    return convertToPlainObject(data) as unknown as Product[];
  }

  // Create a product variant
  export async function createProductVariant(data: z.infer<typeof insertProductVariantSchema>) {
    try {
      const variant = insertProductVariantSchema.parse(data);
      await prisma.productVariant.create({ data: variant });
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