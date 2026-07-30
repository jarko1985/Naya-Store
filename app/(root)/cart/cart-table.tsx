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
        variant='outline'
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
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='w-4 h-4' />
        )}
      </Button>
    );
  }
  
  function RemoveButton({ item }: { item: CartItem }) {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        variant='outline'
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
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Minus className='w-4 h-4' />
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
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className='text-center'>Quantity</TableHead>
                    <TableHead className='text-right'>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={`${item.slug}-${item.variantId ?? 'base'}`}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center'
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <div className='px-2'>
                            <p>{item.name}</p>
                            {(item.color || item.size) && (
                              <p className='text-xs text-muted-foreground'>
                                {[item.color, item.size].filter(Boolean).join(' / ')}
                              </p>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className='flex-center gap-2'>
                        <RemoveButton item={item} />
                        <span>{item.qty}</span>
                        <AddButton item={item} />
                      </TableCell>
                      <TableCell className='text-right'>${item.price}</TableCell>
                    </TableRow>
                  ))}
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