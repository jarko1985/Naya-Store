'use server';
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
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
  const product = await prisma.product.findFirst({
    where: { slug },
  });
  return product ? convertToPlainObject(product) : null;
}
  export async function getProductById(productId: string) {
    const data = await prisma.product.findFirst({
      where: { id: productId },
    });
  
    return convertToPlainObject(data);
  }  
