'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader, RotateCcw } from 'lucide-react';
import { reorderFromOrder } from '@/lib/actions/cart.actions';

const BuyAgainButton = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const res = await reorderFromOrder(orderId);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const skippedNote =
        res.skipped.length > 0
          ? ` (${res.skipped.map((s) => `${s.name}: ${s.reason}`).join(', ')})`
          : '';

      toast.success(`${res.message}${skippedNote}`, {
        action: {
          label: 'Go To Cart',
          onClick: () => router.push('/cart'),
        },
      });
    });
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={isPending}
      className='inline-flex items-center gap-1 px-2 text-primary hover:underline disabled:opacity-50'
    >
      {isPending ? (
        <Loader className='w-3.5 h-3.5 animate-spin' />
      ) : (
        <RotateCcw className='w-3.5 h-3.5' />
      )}
      Buy again
    </button>
  );
};

export default BuyAgainButton;
