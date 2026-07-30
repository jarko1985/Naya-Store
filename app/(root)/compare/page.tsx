'use client';

import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { useCompare } from '@/lib/hooks/use-compare';
import { getProductsByIds } from '@/lib/actions/product.action';
import { Product } from '@/types';
import CompareTable from '@/components/shared/compare/compare-table';
import EmptyState from '@/components/shared/empty-state';

const ComparePage = () => {
  const { ids, remove, clear } = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    setLoaded(false);
    getProductsByIds(ids).then((data) => {
      if (!cancelled) {
        // preserve the order products were added in
        const ordered = ids
          .map((id) => (data as unknown as Product[]).find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        setProducts(ordered);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className='space-y-4 py-4'>
      <div className='flex-between'>
        <h1 className='h2-bold'>Compare Products</h1>
        {products.length > 0 && (
          <button type='button' onClick={clear} className='text-sm text-muted-foreground hover:text-destructive transition-colors'>
            Clear all
          </button>
        )}
      </div>

      {!loaded ? null : products.length === 0 ? (
        <EmptyState
          icon={Scale}
          title='Nothing to compare yet'
          description='Tap the scale icon on any product to add it here — compare up to 4 at once.'
          actionLabel='Browse Products'
          actionHref='/'
        />
      ) : (
        <CompareTable products={products} onRemove={remove} />
      )}
    </div>
  );
};

export default ComparePage;
