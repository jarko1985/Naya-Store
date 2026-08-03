import { MetadataRoute } from 'next';
import { prisma } from '@/db/prisma';
import { SERVER_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, createdAt: true } }),
    prisma.product.groupBy({ by: ['category'] }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SERVER_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SERVER_URL}/search`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map(({ category }) => ({
    url: `${SERVER_URL}/search?category=${encodeURIComponent(category)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map(({ slug, createdAt }) => ({
    url: `${SERVER_URL}/product/${slug}`,
    lastModified: createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
