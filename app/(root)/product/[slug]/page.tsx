import { auth } from '@/auth';
import ProductImages from '@/components/shared/product/product-images';
import ProductPrice from '@/components/shared/product/product-price';
import Rating from '@/components/shared/product/rating';
import VariantSelector from '@/components/shared/product/variant-selector';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getProductBySlug } from "@/lib/actions/product.action";
import { ProductVariant } from '@/types';
import { notFound } from "next/navigation";
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

    <>
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          {/* Images Column */}
          <div className='col-span-2'>
            <ProductImages images={product.images} />
          </div>
          {/* Details Column */}
          <div className='col-span-2 p-5'>
            <div className='flex flex-col gap-6'>
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className='h3-bold'>{product.name}</h1>
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} reviews</p>
              <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                <ProductPrice
                  value={Number(product.price)}
                  className='w-24 rounded-full bg-green-100 text-green-700 px-5 py-2'
                />
                {variants.length > 0 && (
                  <span className='text-sm text-muted-foreground'>starting from</span>
                )}
              </div>
            </div>
            <div className='mt-10'>
              <p className='font-semibold'>Description</p>
              <p>{product.description}</p>
            </div>
          </div>
          {/* Action Column */}
          <div>
            <VariantSelector
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                stock: product.stock,
                images: product.images,
              }}
              variants={variants}
              cart={cart}
            />
          </div>
        </div>
      </section>
      <section className='mt-10'>
        <h2 className='h2-bold mb-5'>Customer Reviews</h2>
        <ReviewList
          userId={userId || ''}
          productId={product.id}
          productSlug={product.slug}
        />
      </section>
    </>
  );
  }

  export default ProductDetailsPage;

