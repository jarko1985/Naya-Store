'use server';

import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { stripe, getOrCreateStripeCustomer } from '../stripe';
import { formatError } from '../utils';
import { revalidatePath } from 'next/cache';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
}

export async function createSetupIntent() {
  try {
    const userId = await requireUserId();
    const customerId = await getOrCreateStripeCustomer(userId);

    const setupIntent = await stripe.setupIntents.create({ customer: customerId });

    return { success: true, clientSecret: setupIntent.client_secret };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export type SavedPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export async function listSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const user = await prisma.user.findFirst({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) return [];

  const [methods, customer] = await Promise.all([
    stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' }),
    stripe.customers.retrieve(user.stripeCustomerId),
  ]);

  const defaultId =
    !customer.deleted && typeof customer.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : null;

  return methods.data
    .filter((pm) => pm.card)
    .map((pm) => ({
      id: pm.id,
      brand: pm.card!.brand,
      last4: pm.card!.last4,
      expMonth: pm.card!.exp_month,
      expYear: pm.card!.exp_year,
      isDefault: pm.id === defaultId,
    }));
}

async function assertOwnsPaymentMethod(userId: string, paymentMethodId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user?.stripeCustomerId) throw new Error('No saved payment methods');

  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== user.stripeCustomerId) throw new Error('Payment method not found');

  return user.stripeCustomerId;
}

export async function deleteSavedPaymentMethod(paymentMethodId: string) {
  try {
    const userId = await requireUserId();
    await assertOwnsPaymentMethod(userId, paymentMethodId);

    await stripe.paymentMethods.detach(paymentMethodId);

    revalidatePath('/user/payment-methods');

    return { success: true, message: 'Payment method removed' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function setDefaultPaymentMethod(paymentMethodId: string) {
  try {
    const userId = await requireUserId();
    const customerId = await assertOwnsPaymentMethod(userId, paymentMethodId);

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    revalidatePath('/user/payment-methods');

    return { success: true, message: 'Default payment method updated' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
