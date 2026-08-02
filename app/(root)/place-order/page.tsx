import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { ShippingAddress } from '@/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import PlaceOrderForm from './place-order-form';
import { MapPin, CreditCard, PackageCheck, Pencil, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Place Order',
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User not found');

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect('/cart');
  if (!user.address) redirect('/shipping-address');
  if (!user.paymentMethod) redirect('/payment-method');

  const userAddress = user.address as ShippingAddress;

  return (
    <>
      <CheckoutSteps current={3} />
      <div className='max-w-5xl mx-auto'>
        <h1 className='text-2xl font-bold pb-1'>Review Your Order</h1>
        <p className='text-sm text-muted-foreground pb-6'>
          Double-check everything below before you place your order.
        </p>
        <div className='grid md:grid-cols-3 md:gap-6 gap-4'>
          <div className='md:col-span-2 space-y-4'>
            <Card>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-3'>
                  <h2 className='flex items-center gap-2 font-semibold'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <MapPin className='w-4 h-4' />
                    </span>
                    Shipping Address
                  </h2>
                  <Link href='/shipping-address'>
                    <Button variant='ghost' size='sm' className='gap-1.5 text-muted-foreground'>
                      <Pencil className='w-3.5 h-3.5' />
                      Edit
                    </Button>
                  </Link>
                </div>
                <p className='text-sm font-medium'>{userAddress.fullName}</p>
                <p className='text-sm text-muted-foreground'>
                  {userAddress.streetAddress}, {userAddress.city}{' '}
                  {userAddress.postalCode}, {userAddress.country}{' '}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-3'>
                  <h2 className='flex items-center gap-2 font-semibold'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <CreditCard className='w-4 h-4' />
                    </span>
                    Payment Method
                  </h2>
                  <Link href='/payment-method'>
                    <Button variant='ghost' size='sm' className='gap-1.5 text-muted-foreground'>
                      <Pencil className='w-3.5 h-3.5' />
                      Edit
                    </Button>
                  </Link>
                </div>
                <p className='text-sm font-medium'>{user.paymentMethod}</p>
              </CardContent>
            </Card>

            <Card className='overflow-hidden'>
              <CardContent className='p-5'>
                <h2 className='flex items-center gap-2 font-semibold mb-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <PackageCheck className='w-4 h-4' />
                  </span>
                  Order Items
                </h2>
                <div className='overflow-x-auto rounded-lg border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className='text-right'>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={`${item.slug}-${item.variantId ?? 'base'}`}>
                          <TableCell className='max-w-[220px]'>
                            <Link
                              href={`/product/${item.slug}`}
                              className='flex items-center'
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className='rounded-md border object-cover shrink-0'
                              />
                              <div className='px-3 min-w-0'>
                                <p className='text-sm line-clamp-2 break-words'>
                                  {item.name}
                                </p>
                                {(item.color || item.size) && (
                                  <p className='text-xs text-muted-foreground truncate'>
                                    {[item.color, item.size].filter(Boolean).join(' / ')}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className='px-2'>{item.qty}</span>
                          </TableCell>
                          <TableCell className='text-right'>
                            {formatCurrency(item.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className='sticky top-20'>
              <CardContent className='p-5 space-y-4'>
                <h2 className='font-semibold'>Order Total</h2>
                <div className='space-y-1.5 text-sm'>
                  <div className='flex justify-between text-muted-foreground'>
                    <div>Items</div>
                    <div>{formatCurrency(cart.itemsPrice)}</div>
                  </div>
                  {Number(cart.discountAmount) > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <div>Discount{cart.couponCode ? ` (${cart.couponCode})` : ''}</div>
                      <div>-{formatCurrency(cart.discountAmount)}</div>
                    </div>
                  )}
                  <div className='flex justify-between text-muted-foreground'>
                    <div>Tax</div>
                    <div>{formatCurrency(cart.taxPrice)}</div>
                  </div>
                  <div className='flex justify-between text-muted-foreground'>
                    <div>Shipping</div>
                    <div>{Number(cart.shippingPrice) === 0 ? 'Free' : formatCurrency(cart.shippingPrice)}</div>
                  </div>
                  <div className='flex justify-between text-base font-bold pt-2 mt-1 border-t'>
                    <div>Total</div>
                    <div>{formatCurrency(cart.totalPrice)}</div>
                  </div>
                </div>
                <PlaceOrderForm />
                <p className='flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
                  <Lock className='w-3 h-3' />
                  Secure, encrypted payment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
