'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Loader, Tag, X, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cart } from '@/types';
import { cn } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { applyCouponToCart, removeCouponFromCart } from '@/lib/actions/coupon.actions';
import TrustBadgeRow from '@/components/shared/trust-badge-row';
import { useCurrency } from '@/components/shared/currency/currency-provider';

const OrderSummarySidebar = ({ cart }: { cart: Cart }) => {
  const router = useRouter();
  const { formatFromUsd } = useCurrency();
  const [isPending, startTransition] = useTransition();
  const [isCouponPending, startCouponTransition] = useTransition();
  const [couponCode, setCouponCode] = useState('');

  const itemsPrice = Number(cart.itemsPrice);
  const discountAmount = Number(cart.discountAmount ?? 0);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - itemsPrice, 0);
  const shippingProgress = Math.min((itemsPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    startCouponTransition(async () => {
      const res = await applyCouponToCart({ code: couponCode.trim() });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setCouponCode('');
    });
  };

  const handleRemoveCoupon = () => {
    startCouponTransition(async () => {
      const res = await removeCouponFromCart();
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    });
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='p-4 space-y-4'>
          {/* Free shipping progress */}
          <div className='space-y-1.5'>
            {remainingForFreeShipping > 0 ? (
              <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
                <Truck className='w-3.5 h-3.5' />
                Add <span className='font-semibold text-foreground'>{formatFromUsd(remainingForFreeShipping)}</span> more for free shipping
              </p>
            ) : (
              <p className='text-xs text-green-600 font-medium flex items-center gap-1.5'>
                <Truck className='w-3.5 h-3.5' />
                You&apos;ve unlocked free shipping!
              </p>
            )}
            <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
              <div
                className={cn('h-full rounded-full transition-all', remainingForFreeShipping > 0 ? 'bg-primary' : 'bg-green-500')}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Promo code */}
          <div className='space-y-2'>
            {cart.couponCode ? (
              <div className='flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2'>
                <span className='flex items-center gap-1.5 text-sm font-medium'>
                  <Tag className='w-3.5 h-3.5' />
                  {cart.couponCode}
                </span>
                <button
                  type='button'
                  onClick={handleRemoveCoupon}
                  disabled={isCouponPending}
                  className='text-muted-foreground hover:text-destructive transition-colors'
                  aria-label='Remove promo code'
                >
                  {isCouponPending ? <Loader className='w-3.5 h-3.5 animate-spin' /> : <X className='w-3.5 h-3.5' />}
                </button>
              </div>
            ) : (
              <div className='flex gap-2'>
                <Input
                  placeholder='Promo code'
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={isCouponPending}
                  className='flex-1'
                />
                <Button
                  type='button'
                  variant='outline'
                  disabled={isCouponPending || !couponCode.trim()}
                  onClick={handleApplyCoupon}
                >
                  {isCouponPending ? <Loader className='w-4 h-4 animate-spin' /> : 'Apply'}
                </Button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className='space-y-1.5 text-sm border-t pt-3'>
            <div className='flex justify-between text-muted-foreground'>
              <span>Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)} items)</span>
              <span>{formatFromUsd(cart.itemsPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className='flex justify-between text-green-600'>
                <span>Discount</span>
                <span>-{formatFromUsd(discountAmount)}</span>
              </div>
            )}
            <div className='flex justify-between text-muted-foreground'>
              <span>Shipping</span>
              <span>{Number(cart.shippingPrice) === 0 ? 'Free' : formatFromUsd(cart.shippingPrice)}</span>
            </div>
            <div className='flex justify-between text-muted-foreground'>
              <span>Tax</span>
              <span>{formatFromUsd(cart.taxPrice)}</span>
            </div>
            <div className='flex justify-between text-base font-bold pt-1.5 border-t'>
              <span>Total</span>
              <span>{formatFromUsd(cart.totalPrice)}</span>
            </div>
          </div>

          <Button
            className='w-full'
            disabled={isPending}
            onClick={() => startTransition(() => router.push('/shipping-address'))}
          >
            {isPending ? <Loader className='w-4 h-4 animate-spin' /> : <ArrowRight className='w-4 h-4' />}{' '}
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>

      <TrustBadgeRow className='grid-cols-2 sm:grid-cols-2' />
    </div>
  );
};

export default OrderSummarySidebar;
