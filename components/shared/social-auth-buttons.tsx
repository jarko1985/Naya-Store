import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaXTwitter } from 'react-icons/fa6';

interface SocialAuthButtonsProps {
  callbackUrl?: string;
}

const SocialAuthButtons = ({ callbackUrl }: SocialAuthButtonsProps) => {
  const redirectTo = callbackUrl || '/';

  return (
    <div className='flex flex-col gap-3'>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>

      <form
        action={async () => {
          'use server';
          await signIn('google', { redirectTo });
        }}
      >
        <Button type='submit' variant='outline' className='w-full gap-2'>
          <FcGoogle className='h-5 w-5' />
          Continue with Google
        </Button>
      </form>

      <form
        action={async () => {
          'use server';
          await signIn('twitter', { redirectTo });
        }}
      >
        <Button type='submit' variant='outline' className='w-full gap-2'>
          <FaXTwitter className='h-5 w-5' />
          Continue with X (Twitter)
        </Button>
      </form>
    </div>
  );
};

export default SocialAuthButtons;
