'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { createCoupon, updateCoupon } from '@/lib/actions/coupon.actions';
import { Coupon } from '@/types';

interface CouponFormDialogProps {
  coupon?: Coupon;
}

const toDateInputValue = (date?: Date | string | null) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

const CouponFormDialog = ({ coupon }: CouponFormDialogProps) => {
  const isEdit = !!coupon;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [code, setCode] = useState(coupon?.code ?? '');
  const [type, setType] = useState<'percent' | 'fixed'>(coupon?.type ?? 'percent');
  const [value, setValue] = useState(coupon ? String(coupon.value) : '');
  const [minOrderValue, setMinOrderValue] = useState(
    coupon?.minOrderValue != null ? String(coupon.minOrderValue) : ''
  );
  const [maxUses, setMaxUses] = useState(coupon?.maxUses != null ? String(coupon.maxUses) : '');
  const [startsAt, setStartsAt] = useState(toDateInputValue(coupon?.startsAt));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(coupon?.expiresAt));
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = {
        code,
        type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        startsAt: startsAt || undefined,
        expiresAt: expiresAt || undefined,
        isActive,
      };

      const res = isEdit
        ? await updateCoupon({ ...payload, id: coupon!.id })
        : await createCoupon(payload);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setOpen(false);
      if (!isEdit) {
        setCode('');
        setValue('');
        setMinOrderValue('');
        setMaxUses('');
        setStartsAt('');
        setExpiresAt('');
        setIsActive(true);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant='outline' size='sm'>
            <Pencil className='w-3.5 h-3.5' />
          </Button>
        ) : (
          <Button>
            <Plus className='w-4 h-4' />
            Create Coupon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label>Code</Label>
            <Input
              placeholder='e.g. SUMMER20'
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'percent' | 'fixed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='percent'>Percent off</SelectItem>
                  <SelectItem value='fixed'>Fixed amount off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Value {type === 'percent' ? '(%)' : '($)'}</Label>
              <Input
                placeholder={type === 'percent' ? 'e.g. 20' : 'e.g. 10.00'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Min order value ($)</Label>
              <Input
                placeholder='optional'
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Max uses</Label>
              <Input
                placeholder='optional'
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Starts at</Label>
              <Input type='date' value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>Expires at</Label>
              <Input type='date' value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <Label className='text-sm font-medium'>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={isPending || !code || !value} onClick={handleSubmit}>
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CouponFormDialog;
