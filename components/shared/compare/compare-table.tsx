'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CompareTableProps {
  products: Product[];
  onRemove: (id: string) => void;
}

const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
  { label: 'Price', render: (p) => formatCurrency(p.price) },
  {
    label: 'Rating',
    render: (p) => (
      <span className='flex items-center gap-1'>
        <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
        {p.rating} ({p.numReviews})
      </span>
    ),
  },
  { label: 'Brand', render: (p) => p.brand },
  { label: 'Category', render: (p) => p.category },
  {
    label: 'Colors',
    render: (p) => {
      const colors = [...new Set([p.color, ...(p.variants ?? []).map((v) => v.color)].filter(Boolean))];
      return colors.join(', ') || '—';
    },
  },
  {
    label: 'Sizes',
    render: (p) => {
      const sizes = [...new Set([p.size, ...(p.variants ?? []).map((v) => v.size)].filter(Boolean))];
      return sizes.join(', ') || '—';
    },
  },
  {
    label: 'Availability',
    render: (p) => (p.stock > 0 ? <span className='text-green-600'>In Stock</span> : <span className='text-destructive'>Out of Stock</span>),
  },
];

const CompareTable = ({ products, onRemove }: CompareTableProps) => {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm border-collapse'>
        <thead>
          <tr>
            <th className='w-32' />
            {products.map((product) => (
              <th key={product.id} className='text-left align-top p-3 min-w-[200px]'>
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => onRemove(product.id)}
                    className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors'
                    title='Remove from comparison'
                  >
                    <X className='w-3.5 h-3.5' />
                  </button>
                  <Link href={`/product/${product.slug}`} className='block'>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={160}
                      height={160}
                      className='w-full aspect-square object-cover rounded-lg border mb-2'
                    />
                    <p className='font-medium line-clamp-2'>{product.name}</p>
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className='border-t border-border'>
              <td className='p-3 font-medium text-muted-foreground align-top'>{row.label}</td>
              {products.map((product) => (
                <td key={product.id} className='p-3 align-top'>
                  {row.render(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompareTable;
