'use client';

import { motion } from 'framer-motion';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';

interface ProductBadgesProps {
  price: string | number;
  compareAtPrice?: string | number | null;
  stock: number;
  className?: string;
}

const ProductBadges = ({ price, compareAtPrice, stock, className }: ProductBadgesProps) => {
  const numPrice = Number(price);
  const numCompareAt = compareAtPrice ? Number(compareAtPrice) : null;
  const isOnSale = !!numCompareAt && numCompareAt > numPrice;
  const percentOff = isOnSale ? Math.round(((numCompareAt! - numPrice) / numCompareAt!) * 100) : 0;
  const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  if (!isOnSale && !isLowStock) return null;

  return (
    <div className={className ?? 'absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5'}>
      {isOnSale && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center gap-1 overflow-hidden rounded-md bg-linear-to-br from-rose-500 to-red-600 px-2 py-1 text-[11px] font-bold tracking-wide text-white shadow-[0_2px_10px_-2px_rgba(225,29,72,0.6)] ring-1 ring-white/25"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/25 via-transparent to-transparent"
          />
          <span className="relative tabular-nums">-{percentOff}%</span>
        </motion.span>
      )}
      {isLowStock && (
        <span className="rounded-md border bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
          Only {stock} left
        </span>
      )}
    </div>
  );
};

export default ProductBadges;
