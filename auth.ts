import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import { authConfig } from '@/auth.config';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';

// Twitter/X does not return an email address. Override createUser to generate
// a unique placeholder so Prisma's NOT NULL email constraint is satisfied.
const prismaAdapter = PrismaAdapter(prisma);
const customAdapter = {
  ...prismaAdapter,
  createUser: async ({ id: _id, ...data }: Parameters<NonNullable<typeof prismaAdapter.createUser>>[0]) => {
    const email = data.email ?? randomUUID();

    // If a guest checkout already created a row for this email, claim it
    // instead of hitting the unique-email constraint on create.
    const existingGuest = await prisma.user.findFirst({ where: { email, isGuest: true } });
    if (existingGuest) {
      return prisma.user.update({
        where: { id: existingGuest.id },
        data: {
          name: data.name ?? existingGuest.name,
          image: data.image ?? existingGuest.image,
          isGuest: false,
        },
      });
    }

    return prisma.user.create({
      data: {
        ...data,
        email,
        name: data.name ?? undefined,
      },
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: customAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.email == null || credentials?.password == null)
          return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        const user = await prisma.user.findFirst({
          where: { email },
        });

        // Check if user exists and if the password matches
        if (user?.password) {
          const isMatch = compareSync(password, user.password);

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              currency: user.currency,
            };
          }
        }
        // If user does not exist or password does not match return null
        return null;
      },
    }),
    CredentialsProvider({
      id: 'guest-checkout',
      name: 'Guest Checkout',
      credentials: {
        email: { type: 'email' },
      },
      async authorize(credentials) {
        if (credentials?.email == null) return null;

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await prisma.user.findFirst({
          where: { email },
        });

        // Only ever authenticate an existing guest row here — never a real
        // account — since this provider takes no password.
        if (!user || !user.isGuest) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          currency: user.currency,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user, trigger, token }) {
      // Set the user ID from the token
      session.user.id = token.sub as string;
      session.user.role = typeof token.role === 'string' ? token.role : undefined;
      session.user.currency = typeof token.currency === 'string' ? token.currency : undefined;
      session.user.name = token.name as string;

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;


        // If user has no name then use the email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // Update database to reflect the token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        const cookiesObject = await cookies();

        // Currency preference: same merge-on-signin pattern as the guest
        // cart below — the browser's cookie choice (if any) wins and gets
        // persisted onto the account, so it carries over on next login from
        // any device. Falls back to the account's saved preference on a
        // fresh device with no cookie yet.
        const currencyCookie = cookiesObject.get('currency')?.value;
        if (
          currencyCookie &&
          (SUPPORTED_CURRENCIES as readonly string[]).includes(currencyCookie)
        ) {
          token.currency = currencyCookie;
          if (currencyCookie !== user.currency) {
            await prisma.user.update({
              where: { id: user.id },
              data: { currency: currencyCookie },
            });
          }
        } else {
          token.currency = user.currency ?? 'USD';
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // Delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
  }
} satisfies NextAuthConfig);