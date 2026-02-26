import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import type { NextAuthConfig } from 'next-auth';

const { auth } = NextAuth(authConfig as NextAuthConfig);
export const middleware = auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/product/:path*'],
};