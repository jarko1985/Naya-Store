'use server';

import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../constants';
import { formatError } from '../utils';

// Sets the active display/charge currency for this browser (cookie), and —
// if signed in — persists it onto the user's account so it carries over to
// their next sign-in on any device (same reconciliation the jwt callback in
// auth.ts performs on sign-in itself).
export async function setCurrency(currency: string) {
  try {
    if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(currency)) {
      throw new Error('Unsupported currency');
    }
    const typedCurrency = currency as SupportedCurrency;

    const cookieStore = await cookies();
    cookieStore.set('currency', typedCurrency, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });

    const session = await auth();
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { currency: typedCurrency },
      });
    }

    return { success: true, currency: typedCurrency };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
