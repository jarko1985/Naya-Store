import { DefaultSession } from 'next-auth';

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    currency?: string;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      role?: string;
      currency?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    currency?: string;
  }
}
