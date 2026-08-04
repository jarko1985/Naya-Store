import Stripe from 'stripe';
import { prisma } from '@/db/prisma';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Returns the user's Stripe Customer id, creating one (and persisting it)
// the first time it's needed.
export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
