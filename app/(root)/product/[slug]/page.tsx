import { auth } from '@/auth';
import ProductDetailsClient from '@/components/shared/product/product-details-client';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getProductBySlug, getRelatedProducts } from '@/lib/actions/product.action';
import { getReviews } from '@/lib/actions/review.actions';
import { isProductWishlisted } from '@/lib/actions/wishlist.actions';
import { recordProductView, getRecentlyViewed } from '@/lib/actions/recently-viewed.actions';
import { Product, ProductVariant, RecentlyViewedItem } from '@/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReviewList from './review-list';
import ProductList from '@/components/shared/product/product-list';
import { SERVER_URL } from '@/lib/constants';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.length ? [product.images[0]] : undefined,
    },
  };
}

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const cart = await getMyCart();
  const initialWishlisted = await isProductWishlisted({ productId: product.id });

  await recordProductView(product.id);

  const [relatedProducts, recentlyViewed, { data: reviews }] = await Promise.all([
    getRelatedProducts({ productId: product.id, category: product.category }),
    getRecentlyViewed(product.id) as Promise<RecentlyViewedItem[]>,
    getReviews({ productId: product.id }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: ProductVariant[] = ((product as any).variants as ProductVariant[]) ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { '@type': 'Brand', name: product.brand },
    aggregateRating:
      product.numReviews > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating),
            reviewCount: product.numReviews,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SERVER_URL}/product/${product.slug}`,
      priceCurrency: 'USD',
      price: Number(product.price),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 space-y-16'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Product details */}
      <ProductDetailsClient
        product={product as unknown as Product}
        variants={variants}
        cart={cart}
        userId={userId}
        initialWishlisted={initialWishlisted}
        reviews={reviews}
      />

      {/* Customer Reviews */}
      <section id='reviews'>
        <h2 className='text-2xl font-bold mb-6'>Customer Reviews</h2>
        <ReviewList
          userId={userId || ''}
          productId={product.id}
          productSlug={product.slug}
          averageRating={Number(product.rating)}
          numReviews={product.numReviews}
        />
      </section>

      {relatedProducts.length > 0 && (
        <ProductList data={relatedProducts as Product[]} title='Related Products' />
      )}

      {recentlyViewed.length > 0 && (
        <ProductList
          data={recentlyViewed.map((item) => item.product)}
          title='Recently Viewed'
        />
      )}
    </div>
  );
};

export default ProductDetailsPage;
