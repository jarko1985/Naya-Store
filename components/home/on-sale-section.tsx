import Link from 'next/link';
import { Flame } from 'lucide-react';
import { getOnSaleProducts } from '@/lib/actions/product.action';
import ProductCard from '@/components/shared/product/product-card';
import { Product } from '@/types';

const OnSaleSection = async () => {
  const products = (await getOnSaleProducts()) as Product[];

  if (products.length === 0) return null;

  return (
    <section className='mb-12 rounded-2xl border bg-gradient-to-br from-destructive/5 to-orange-500/5 shadow-sm p-6'>
      <div className='flex items-end justify-between mb-6'>
        <div>
          <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-destructive mb-1'>
            <Flame className='w-3.5 h-3.5' />
            Limited Time
          </p>
          <h2 className='text-2xl font-bold'>On Sale Now</h2>
        </div>
        <Link
          href='/search'
          className='text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block'
        >
          Browse all →
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
};

export default OnSaleSection;
