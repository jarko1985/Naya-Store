'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, formatId, toMinorUnits } from '@/lib/utils';
import { Order } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTransition } from 'react';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidCOD,
} from '@/lib/actions/order.actions';
import StripePayment from './stripe-payment';
import OrderConfirmationBanner from '@/components/shared/order/order-confirmation-banner';
import ShipmentTimeline from '@/components/shared/order/shipment-timeline';
import ShipmentStatusForm from '@/components/shared/order/shipment-status-form';
import ReturnRequestForm from '@/components/shared/order/return-request-form';
import ReturnStatusBadge from '@/components/shared/order/return-status-badge';
import { RETURN_WINDOW_DAYS } from '@/lib/constants';
import { MapPin, CreditCard, PackageCheck, Truck, RotateCcw } from 'lucide-react';

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Omit<Order, 'paymentResult'>;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    couponCode,
    totalPrice,
    currency,
    paymentMethod,
    isPaid,
    paidAt,
    createdAt,
    shipment,
    returns,
  } = order;

  const withinReturnWindow =
    !!shipment?.deliveredAt &&
    (Date.now() - new Date(shipment.deliveredAt).getTime()) / (1000 * 60 * 60 * 24) <=
      RETURN_WINDOW_DAYS;


  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = '';

    if (isPending) {
      status = 'Loading PayPal...';
    } else if (isRejected) {
      status = 'Error Loading PayPal';
    }
    return status;
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if (!res.success) {
      toast.error(res.message);
      throw new Error(res.message);
    }

    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);

    toast.success(res.message);
  };

  // Button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type='button'
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id);
            toast.success(res.message);
          })
        }
      >
        {isPending ? 'processing...' : 'Mark As Paid'}
      </Button>
    );
  };

  return (
    <>
      <OrderConfirmationBanner />
      <div className='max-w-5xl mx-auto'>
        <h1 className='text-2xl font-bold pb-1'>Order {formatId(id)}</h1>
        <p className='text-sm text-muted-foreground pb-6'>
          Here&apos;s a summary of your order.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
          <div className='md:col-span-2 space-y-4'>
            <Card>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-3'>
                  <h2 className='flex items-center gap-2 font-semibold'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <CreditCard className='w-4 h-4' />
                    </span>
                    Payment Method
                  </h2>
                  {isPaid ? (
                    <Badge variant='secondary'>
                      Paid at {formatDateTime(paidAt!).dateTime}
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>Not paid</Badge>
                  )}
                </div>
                <p className='text-sm font-medium'>{paymentMethod}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-5'>
                <h2 className='flex items-center gap-2 font-semibold mb-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Truck className='w-4 h-4' />
                  </span>
                  Shipment Status
                </h2>
                <ShipmentTimeline shipment={shipment} placedAt={createdAt} />
                {shipment && (shipment.carrier || shipment.trackingNumber) && (
                  <p className='text-sm text-muted-foreground mt-4'>
                    {[shipment.carrier, shipment.trackingNumber].filter(Boolean).join(' — ')}
                  </p>
                )}
                {isAdmin && shipment && (
                  <div className='mt-4 pt-4 border-t'>
                    <ShipmentStatusForm orderId={id} shipment={shipment} />
                  </div>
                )}
              </CardContent>
            </Card>

            {(returns.length > 0 || (!isAdmin && isPaid && shipment?.status === 'delivered' && withinReturnWindow)) && (
              <Card>
                <CardContent className='p-5'>
                  <h2 className='flex items-center gap-2 font-semibold mb-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <RotateCcw className='w-4 h-4' />
                    </span>
                    Returns
                  </h2>
                  {returns.length > 0 && (
                    <div className='space-y-2 mb-3'>
                      {returns.map((ret) => (
                        <div
                          key={ret.id}
                          className='flex items-center justify-between rounded-md border p-3 text-sm'
                        >
                          <div>
                            <p className='font-medium'>{formatId(ret.id)}</p>
                            <p className='text-xs text-muted-foreground'>
                              {ret.items.length} item(s) &middot; {formatDateTime(ret.createdAt).dateTime}
                            </p>
                            {ret.status === 'resolved' && ret.refundAmount && (
                              <p className='text-xs text-muted-foreground'>
                                Refunded {formatCurrency(ret.refundAmount, currency)}
                              </p>
                            )}
                          </div>
                          <ReturnStatusBadge status={ret.status} />
                        </div>
                      ))}
                    </div>
                  )}
                  {!isAdmin && isPaid && shipment?.status === 'delivered' && withinReturnWindow && (
                    <ReturnRequestForm
                      orderId={id}
                      orderitems={orderitems}
                      returns={returns}
                      currency={currency}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className='p-5'>
                <h2 className='flex items-center gap-2 font-semibold mb-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <MapPin className='w-4 h-4' />
                  </span>
                  Shipping Address
                </h2>
                <p className='text-sm font-medium'>{shippingAddress.fullName}</p>
                <p className='text-sm text-muted-foreground'>
                  {shippingAddress.streetAddress}, {shippingAddress.city},{' '}
                  {shippingAddress.postalCode}, {shippingAddress.country}
                </p>
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
                      {orderitems.map((item) => (
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
                            {formatCurrency(item.price, currency)}
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
                    <div>{formatCurrency(itemsPrice, currency)}</div>
                  </div>
                  {Number(discountAmount) > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <div>Discount{couponCode ? ` (${couponCode})` : ''}</div>
                      <div>-{formatCurrency(discountAmount, currency)}</div>
                    </div>
                  )}
                  <div className='flex justify-between text-muted-foreground'>
                    <div>Tax</div>
                    <div>{formatCurrency(taxPrice, currency)}</div>
                  </div>
                  <div className='flex justify-between text-muted-foreground'>
                    <div>Shipping</div>
                    <div>
                      {Number(shippingPrice) === 0
                        ? 'Free'
                        : formatCurrency(shippingPrice, currency)}
                    </div>
                  </div>
                  <div className='flex justify-between text-base font-bold pt-2 mt-1 border-t'>
                    <div>Total</div>
                    <div>{formatCurrency(totalPrice, currency)}</div>
                  </div>
                </div>

                {/* PayPal Payment */}
                {!isPaid && paymentMethod === 'PayPal' && (
                  <div>
                    <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                      <PrintLoadingState />
                      <PayPalButtons
                        createOrder={handleCreatePayPalOrder}
                        onApprove={handleApprovePayPalOrder}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}

                {/* Stripe Payment */}
                {!isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
                  <StripePayment
                    priceInMinorUnits={toMinorUnits(Number(order.totalPrice), currency)}
                    currency={currency}
                    orderId={order.id}
                    clientSecret={stripeClientSecret}
                  />
                )}

                {/* Cash On Delivery */}
                {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                  <MarkAsPaidButton />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;