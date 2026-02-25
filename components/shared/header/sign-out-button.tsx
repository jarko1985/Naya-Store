'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  return (
    <Button
      className='w-full py-4 px-2 h-4 justify-start'
      variant='ghost'
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      Sign Out
    </Button>
  );
}
