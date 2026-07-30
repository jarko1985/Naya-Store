import { Badge } from '@/components/ui/badge';
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
    <div className={className ?? 'absolute top-2 left-2 z-10 flex flex-col gap-1'}>
      {isOnSale && (
        <Badge className='bg-destructive text-destructive-foreground hover:bg-destructive'>
          -{percentOff}%
        </Badge>
      )}
      {isLowStock && (
        <Badge variant='outline' className='bg-background/90 backdrop-blur-sm'>
          Only {stock} left
        </Badge>
      )}
    </div>
  );
};

export default ProductBadges;
