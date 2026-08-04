import { Metadata } from 'next';
import { getOrderById } from '@/lib/actions/order.actions';
import { notFound, redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import { auth } from '@/auth';
import OrderDetailsTable from './order-details-table';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { toMinorUnits } from '@/lib/utils';
export const metadata: Metadata = {
    title: 'Order Details',
  };

  const OrderDetailsPage = async (props: {
    params: Promise<{
      id: string;
    }>;
  }) => {
    const { id } = await props.params;
  
    const order = await getOrderById(id);
    if (!order) notFound();
  
    const session = await auth();
  
    // Redirect the user if they don't own the order
    if (order.userId !== session?.user.id && session?.user.role !== 'admin') {
      return redirect('/unauthorized');
    }
  
    let client_secret = null;

    // Check if is not paid and using stripe
    if (order.paymentMethod === 'Stripe' && !order.isPaid) {
      // A customer attached to the PaymentIntent lets Stripe's PaymentElement
      // surface the user's saved cards as one-click options, and
      // setup_future_usage attaches any newly-entered card for next time.
      const customerId = await getOrCreateStripeCustomer(order.userId);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: toMinorUnits(Number(order.totalPrice), order.currency),
        currency: order.currency.toLowerCase(),
        customer: customerId,
        setup_future_usage: 'off_session',
        metadata: { orderId: order.id },
      });
      client_secret = paymentIntent.client_secret;
    }
  
    return (
       
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
          exchangeRate: Number(order.exchangeRate),
        }}
        stripeClientSecret={client_secret}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    );
  };
  
  export default OrderDetailsPage;