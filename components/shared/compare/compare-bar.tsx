'use client';

import Link from 'next/link';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/lib/hooks/use-compare';

const CompareBar = () => {
  const { ids, clear } = useCompare();

  if (ids.length < 2) return null;

  return (
    <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border bg-background shadow-lg px-4 py-2.5'>
      <Scale className='w-4 h-4 text-primary' />
      <span className='text-sm font-medium'>Compare ({ids.length})</span>
      <Button asChild size='sm' className='rounded-full'>
        <Link href='/compare'>View</Link>
      </Button>
      <button
        type='button'
        onClick={clear}
        title='Clear comparison'
        className='text-muted-foreground hover:text-destructive transition-colors'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
};

export default CompareBar;
