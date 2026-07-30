'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { subscribeToNewsletter } from '@/lib/actions/subscriber.actions';
import { cn } from '@/lib/utils';

const NewsletterForm = ({ source, className }: { source: string; className?: string }) => {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      const res = await subscribeToNewsletter({ email, source });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setEmail('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-0', className)}>
      <input
        type='email'
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter email address'
        disabled={isPending}
        className='flex-1 min-w-0 bg-gray-100 border border-gray-200 px-3 py-2 text-sm focus:outline-none disabled:opacity-60'
      />
      <button
        type='submit'
        disabled={isPending}
        className='bg-black text-white px-5 py-2 text-sm font-medium shrink-0 disabled:opacity-60'
      >
        {isPending ? '...' : 'Subscribe'}
      </button>
    </form>
  );
};

export default NewsletterForm;
