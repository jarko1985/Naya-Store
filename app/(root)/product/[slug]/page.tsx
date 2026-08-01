import { auth } from '@/auth';
import ProductDetailsClient from '@/components/shared/product/product-details-client';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getProductBySlug, getRelatedProducts } from '@/lib/actions/product.action';
import { getReviews } from '@/lib/actions/review.actions';
import { isProductWishlisted } from '@/lib/actions/wishlist.actions';
import { recordProductView, getRecentlyViewed } from '@/lib/actions/recently-viewed.actions';
import { Product, ProductVariant, RecentlyViewedItem } from '@/types';
import { notFound } from 'next/navigation';
import ReviewList from './review-list';
import ProductList from '@/components/shared/product/product-list';

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

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 space-y-16'>
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
