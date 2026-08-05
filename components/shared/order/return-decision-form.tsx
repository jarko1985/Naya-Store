'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { approveReturn, rejectReturn, resolveReturn } from '@/lib/actions/return.actions';

const ReturnDecisionForm = ({ returnId, status }: { returnId: string; status: string }) => {
  const [adminNote, setAdminNote] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const run = (
    action: (id: string, note?: string) => Promise<{ success: boolean; message: string }>
  ) => {
    startTransition(async () => {
      const res = await action(returnId, adminNote);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  if (status === 'requested') {
    return (
      <div className='space-y-3'>
        <Textarea
          placeholder='Optional note for the customer'
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
        <div className='flex gap-2'>
          <Button type='button' disabled={isPending} onClick={() => run(approveReturn)}>
            {isPending ? 'Saving...' : 'Approve'}
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={isPending}
            onClick={() => run(rejectReturn)}
          >
            Reject
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <Button type='button' disabled={isPending} onClick={() => run((id) => resolveReturn(id))}>
        {isPending ? 'Processing refund...' : 'Resolve & Issue Refund'}
      </Button>
    );
  }

  return null;
};

export default ReturnDecisionForm;
