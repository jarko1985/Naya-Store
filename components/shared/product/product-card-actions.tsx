'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heart, Loader, Scale } from 'lucide-react';
import { toggleWishlistItem } from '@/lib/actions/wishlist.actions';
import { useCompare } from '@/lib/hooks/use-compare';
import { cn } from '@/lib/utils';

interface ProductCardActionsProps {
  productId: string;
  initialWishlisted: boolean;
  isSignedIn: boolean;
}

const ProductCardActions = ({ productId, initialWishlisted, isSignedIn }: ProductCardActionsProps) => {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isComparing, toggle: toggleCompare, limit } = useCompare();
  const comparing = isComparing(productId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const nextState = !wishlisted;
    setWishlisted(nextState);

    startTransition(async () => {
      const res = await toggleWishlistItem({ productId });
      if (!res.success) {
        setWishlisted(!nextState);
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    });
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = toggleCompare(productId);
    if (result === 'limit-reached') {
      toast.error(`You can compare up to ${limit} products at a time`);
    }
  };

  return (
    <div className='absolute top-2 right-2 z-10 flex flex-col gap-1.5'>
      <button
        type='button'
        onClick={handleWishlistClick}
        disabled={isPending}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          'bg-background/90 backdrop-blur-sm border shadow-sm transition-all hover:scale-105',
          wishlisted ? 'text-red-500 border-red-200' : 'text-muted-foreground'
        )}
      >
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Heart className={cn('w-4 h-4', wishlisted && 'fill-red-500')} />
        )}
      </button>
      <button
        type='button'
        onClick={handleCompareClick}
        title={comparing ? 'Remove from compare' : 'Add to compare'}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          'bg-background/90 backdrop-blur-sm border shadow-sm transition-all hover:scale-105',
          comparing ? 'text-primary border-primary/30' : 'text-muted-foreground'
        )}
      >
        <Scale className='w-4 h-4' />
      </button>
    </div>
  );
};

export default ProductCardActions;
