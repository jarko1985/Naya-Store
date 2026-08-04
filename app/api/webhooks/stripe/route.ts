import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';
import { getCurrencyDecimals } from '@/lib/utils';

export async function POST(req: NextRequest) {
  // Build the webhook event
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  // Check for successful payment
  if (event.type === 'charge.succeeded') {
    const { object } = event.data;

    // Update order status. object.currency is the currency actually charged
    // (lowercase ISO code from Stripe); its minor-unit divisor depends on
    // that currency's decimal precision (2 for most, 3 for JOD/KWD/OMR), not
    // always /100.
    const chargeCurrency = object.currency.toUpperCase();
    const decimals = getCurrencyDecimals(chargeCurrency);
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: 'COMPLETED',
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 10 ** decimals).toFixed(decimals),
      },
    });

    return NextResponse.json({
      message: 'updateOrderToPaid was successful',
    });
  }

  return NextResponse.json({
    message: 'event is not charge.succeeded',
  });
}