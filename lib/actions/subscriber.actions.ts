'use server';

import { z } from 'zod';
import { newsletterSchema } from '../validators';
import { formatError } from '../utils';
import { prisma } from '@/db/prisma';

// Subscribe an email to the newsletter (public, no auth required)
export async function subscribeToNewsletter(
  data: z.infer<typeof newsletterSchema>
) {
  try {
    const { email, source } = newsletterSchema.parse(data);
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.subscriber.findFirst({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: true, message: "You're already subscribed" };
    }

    await prisma.subscriber.create({
      data: { email: normalizedEmail, source },
    });

    return { success: true, message: 'Subscribed! Watch your inbox for updates.' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
