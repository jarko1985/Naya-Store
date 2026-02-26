import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * Minimal auth config for Edge middleware.
 * Keep this file free of Prisma, database adapters, and heavy providers
 * so the middleware bundle stays under Vercel's 1 MB Edge limit.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  providers: [], // Required by type; only used for route handlers, not middleware
  callbacks: {
    authorized({ request }) {
      if (!request.cookies.get('sessionCartId')) {
        const sessionCartId = crypto.randomUUID();
        const response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set('sessionCartId', sessionCartId);
        return response;
      }
      return true;
    },
  },
};
