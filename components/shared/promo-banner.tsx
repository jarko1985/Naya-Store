'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PROMO_BANNER_MESSAGE } from '@/lib/constants';

const DISMISS_KEY = 'promo-banner-dismissed';

const PromoBanner = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === PROMO_BANNER_MESSAGE);
  }, []);

  if (dismissed) return null;

  return (
    <div className='relative bg-primary text-primary-foreground text-center text-sm py-2 px-8 shadow-sm'>
      <span>{PROMO_BANNER_MESSAGE}</span>
      <button
        type='button'
        aria-label='Dismiss'
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, PROMO_BANNER_MESSAGE);
          setDismissed(true);
        }}
        className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
};

export default PromoBanner;
