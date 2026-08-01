'use client';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { Loader, Minus, Plus } from 'lucide-react';
import { Cart, CartItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import OrderSummarySidebar from '@/components/shared/cart/order-summary-sidebar';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

function AddButton({ item }: { item: CartItem }) {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        variant='ghost'
        size='icon-sm'
        className='rounded-none hover:bg-muted'
        type='button'
        onClick={() =>
          startTransition(async () => {
            const res = await addItemToCart(item);

            if (!res.success) {
              toast.error(res.message);
            }
          })
        }
      >
        {isPending ? (
          <Loader className='w-3.5 h-3.5 animate-spin' />
        ) : (
          <Plus className='w-3.5 h-3.5' />
        )}
      </Button>
    );
  }

  function RemoveButton({ item }: { item: CartItem }) {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        variant='ghost'
        size='icon-sm'
        className='rounded-none hover:bg-muted'
        type='button'
        onClick={() =>
          startTransition(async () => {
            const res = await removeItemFromCart(item.productId, item.variantId);

            if (!res.success) {
              toast.error(res.message);
            }
          })
        }
      >
        {isPending ? (
          <Loader className='w-3.5 h-3.5 animate-spin' />
        ) : (
          <Minus className='w-3.5 h-3.5' />
        )}
      </Button>
    );
  }
  
  const CartTable = ({ cart }: { cart?: Cart }) => {
    return (
      <>
        <h1 className='py-4 h2-bold'>Shopping Cart</h1>
        {!cart || cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title='Your cart is empty'
            description="Looks like you haven't added anything to your cart yet."
            actionLabel='Start Shopping'
            actionHref='/'
          />
        ) : (
          <div className='grid md:grid-cols-4 md:gap-5'>
            <div className='overflow-x-auto md:col-span-3 rounded-xl border bg-card shadow-sm'>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Item
                    </TableHead>
                    <TableHead className='text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Quantity
                    </TableHead>
                    <TableHead className='text-right px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => {
                    const unitPrice = Number(item.price);
                    const lineTotal = unitPrice * item.qty;
                    return (
                      <TableRow key={`${item.slug}-${item.variantId ?? 'base'}`}>
                        <TableCell className='whitespace-normal w-full px-4 py-4'>
                          <Link
                            href={`/product/${item.slug}`}
                            className='group flex items-center gap-4'
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={112}
                              height={112}
                              className='rounded-xl border bg-muted/20 object-cover w-24 h-24 sm:w-28 sm:h-28 shrink-0 shadow-sm'
                            />
                            <div className='min-w-0'>
                              <p className='font-medium leading-snug break-words line-clamp-2 group-hover:text-primary transition-colors'>
                                {item.name}
                              </p>
                              {(item.color || item.size) && (
                                <span className='inline-block mt-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5'>
                                  {[item.color, item.size].filter(Boolean).join(' / ')}
                                </span>
                              )}
                              <p className='text-xs text-muted-foreground mt-2'>
                                ${unitPrice.toFixed(2)} each
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className='flex justify-center'>
                            <div className='flex items-center rounded-full border bg-muted/20 overflow-hidden'>
                              <RemoveButton item={item} />
                              <span className='w-8 text-center text-sm font-medium tabular-nums'>
                                {item.qty}
                              </span>
                              <AddButton item={item} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-right px-4 font-semibold text-base whitespace-nowrap'>
                          ${lineTotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div>
              <OrderSummarySidebar cart={cart} />
            </div>
          </div>
        )}
      </>
    );
  };
  
  export default CartTable;