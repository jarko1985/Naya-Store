'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

const OrderConfirmationBanner = () => {
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === '1';

  if (!isNew) return null;

  return (
    <div className='flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 px-4 py-3 mb-4'>
      <CheckCircle2 className='w-5 h-5 text-green-600 shrink-0' />
      <div>
        <p className='text-sm font-semibold text-green-800 dark:text-green-400'>Order placed successfully!</p>
        <p className='text-xs text-green-700/80 dark:text-green-500/80'>
          Thanks for your purchase — we&apos;ve got the details below.
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationBanner;
