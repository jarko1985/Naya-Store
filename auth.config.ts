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
    authorized({ request, auth }) {
      const protectedPaths = [
       /\/shipping-address/,
       /\/payment-method/,
       /\/place-order/,
       /\/profile/,
       /\/user\/(.*)/,
       /\/order\/(.*)/,
       /\/admin/,
      ];
      const {pathname} = request.nextUrl;
      if(!auth && protectedPaths.some((p)=>p.test(pathname))) return false
      if (protectedPaths.some((path) => request.nextUrl.pathname.match(path))) {
        return !!auth;
      }
      return true;
    },
  },
};
