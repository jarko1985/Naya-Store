import { auth } from '@/auth';
import ProductDetailsClient from '@/components/shared/product/product-details-client';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getProductBySlug } from '@/lib/actions/product.action';
import { Product, ProductVariant } from '@/types';
import { notFound } from 'next/navigation';
import ReviewList from './review-list';

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const cart = await getMyCart();

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
      />

      {/* Customer Reviews */}
      <section id='reviews'>
        <h2 className='text-2xl font-bold mb-6'>Customer Reviews</h2>
        <ReviewList
          userId={userId || ''}
          productId={product.id}
          productSlug={product.slug}
        />
      </section>
    </div>
  );
};

export default ProductDetailsPage;
