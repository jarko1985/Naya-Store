'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { requestReturn } from '@/lib/actions/return.actions';
import { formatCurrency } from '@/lib/utils';
import { OrderItem, Return } from '@/types';

const ReturnRequestForm = ({
  orderId,
  orderitems,
  returns,
  currency,
}: {
  orderId: string;
  orderitems: OrderItem[];
  returns: Return[];
  currency: string;
}) => {
  const remainingByItem = new Map<string, number>();
  for (const item of orderitems) {
    let used = 0;
    for (const ret of returns) {
      if (ret.status === 'rejected') continue;
      for (const ri of ret.items) {
        if (ri.orderItemId === item.id) used += ri.qty;
      }
    }
    remainingByItem.set(item.id, item.qty - used);
  }

  const returnableItems = orderitems.filter((item) => (remainingByItem.get(item.id) ?? 0) > 0);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  if (returnableItems.length === 0) return null;

  const toggleItem = (itemId: string, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[itemId] = 1;
      else delete next[itemId];
      return next;
    });
  };

  const setQty = (itemId: string, qty: number, max: number) => {
    const clamped = Math.min(Math.max(Math.trunc(qty) || 1, 1), max);
    setSelected((prev) => ({ ...prev, [itemId]: clamped }));
  };

  const submit = () => {
    const items = Object.entries(selected).map(([orderItemId, qty]) => ({ orderItemId, qty }));
    if (items.length === 0) {
      toast.error('Select at least one item to return');
      return;
    }
    if (reason.trim().length < 3) {
      toast.error('Please describe the reason for the return');
      return;
    }
    startTransition(async () => {
      const res = await requestReturn({ orderId, reason, items });
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        setSelected({});
        setReason('');
      } else {
        toast.error(res.message);
      }
    });
  };

  if (!open) {
    return (
      <Button type='button' variant='outline' size='sm' onClick={() => setOpen(true)}>
        Request a Return
      </Button>
    );
  }

  return (
    <div className='space-y-3 border rounded-lg p-4'>
      <p className='text-sm font-medium'>Select items to return</p>
      <div className='space-y-2'>
        {returnableItems.map((item) => {
          const max = remainingByItem.get(item.id) ?? 0;
          const checked = item.id in selected;
          return (
            <div key={item.id} className='flex items-center gap-3'>
              <Checkbox
                checked={checked}
                onCheckedChange={(c) => toggleItem(item.id, Boolean(c))}
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm truncate'>{item.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {formatCurrency(item.price, currency)} &middot; up to {max} returnable
                </p>
              </div>
              {checked && (
                <Input
                  type='number'
                  min={1}
                  max={max}
                  value={selected[item.id]}
                  onChange={(e) => setQty(item.id, Number(e.target.value), max)}
                  className='w-16'
                />
              )}
            </div>
          );
        })}
      </div>
      <Textarea
        placeholder='Why are you returning these items?'
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className='flex gap-2'>
        <Button type='button' size='sm' disabled={isPending} onClick={submit}>
          {isPending ? 'Submitting...' : 'Submit Return Request'}
        </Button>
        <Button type='button' size='sm' variant='ghost' onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ReturnRequestForm;
