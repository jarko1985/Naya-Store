import Image from 'next/image';
import { ShieldCheck, Lock, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Cart } from '@/types';
import { formatCurrency } from '@/lib/utils';

const CheckoutOrderSummary = ({ cart }: { cart: Cart }) => {
  const itemCount = cart.items.reduce((a, c) => a + c.qty, 0);
  const discountAmount = Number(cart.discountAmount ?? 0);

  return (
    <div className='space-y-4'>
      <Card className='overflow-hidden'>
        <CardContent className='p-0'>
          <div className='px-5 py-4 border-b bg-muted/30'>
            <h2 className='font-semibold'>Order Summary</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {itemCount} item{itemCount === 1 ? '' : 's'} in your cart
            </p>
          </div>

          {/* Item thumbnails */}
          <div className='px-5 py-4 space-y-3 max-h-64 overflow-y-auto'>
            {cart.items.map((item) => (
              <div key={`${item.slug}-${item.variantId ?? 'base'}`} className='flex items-center gap-3'>
                <div className='relative shrink-0'>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={44}
                    height={44}
                    className='w-11 h-11 rounded-lg border object-cover'
                  />
                  <span className='absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background'>
                    {item.qty}
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium line-clamp-1'>{item.name}</p>
                  {(item.color || item.size) && (
                    <p className='text-xs text-muted-foreground'>
                      {[item.color, item.size].filter(Boolean).join(' / ')}
                    </p>
                  )}
                </div>
                <p className='text-sm font-medium shrink-0'>{formatCurrency(item.price)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className='px-5 py-4 border-t space-y-1.5 text-sm'>
            <div className='flex justify-between text-muted-foreground'>
              <span>Subtotal</span>
              <span>{formatCurrency(cart.itemsPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className='flex justify-between text-green-600'>
                <span>Discount{cart.couponCode ? ` (${cart.couponCode})` : ''}</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className='flex justify-between text-muted-foreground'>
              <span>Shipping</span>
              <span>{Number(cart.shippingPrice) === 0 ? 'Free' : formatCurrency(cart.shippingPrice)}</span>
            </div>
            <div className='flex justify-between text-muted-foreground'>
              <span>Tax</span>
              <span>{formatCurrency(cart.taxPrice)}</span>
            </div>
            <div className='flex justify-between text-base font-bold pt-2 mt-1 border-t'>
              <span>Total</span>
              <span>{formatCurrency(cart.totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust signals */}
      <div className='rounded-xl border bg-card shadow-sm p-4 space-y-2.5'>
        <div className='flex items-center gap-2.5 text-xs text-muted-foreground'>
          <Lock className='w-3.5 h-3.5 text-green-600 shrink-0' />
          Secure, encrypted checkout
        </div>
        <div className='flex items-center gap-2.5 text-xs text-muted-foreground'>
          <ShieldCheck className='w-3.5 h-3.5 text-green-600 shrink-0' />
          30-day money-back guarantee
        </div>
        <div className='flex items-center gap-2.5 text-xs text-muted-foreground'>
          <Truck className='w-3.5 h-3.5 text-green-600 shrink-0' />
          Fast, tracked delivery
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
