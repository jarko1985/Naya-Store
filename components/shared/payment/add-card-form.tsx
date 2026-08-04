'use client';

import { FormEvent, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createSetupIntent } from '@/lib/actions/payment-method.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader, Plus } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const SetupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (stripe == null || elements == null) return;

    setIsLoading(true);
    setErrorMessage('');

    stripe
      .confirmSetup({ elements, redirect: 'if_required' })
      .then(({ error }) => {
        if (error) {
          setErrorMessage(error.message ?? 'An unknown error occurred');
          return;
        }
        onSuccess();
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {errorMessage && <div className='text-destructive text-sm'>{errorMessage}</div>}
      <PaymentElement />
      <Button className='w-full' disabled={stripe == null || elements == null || isLoading}>
        {isLoading ? <Loader className='w-4 h-4 animate-spin' /> : 'Save card'}
      </Button>
    </form>
  );
};

const AddCardForm = () => {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);

    if (next && !clientSecret) {
      setIsLoadingIntent(true);
      const res = await createSetupIntent();
      setIsLoadingIntent(false);

      if (!res.success || !res.clientSecret) {
        toast.error(res.message ?? 'Could not start card setup');
        setOpen(false);
        return;
      }

      setClientSecret(res.clientSecret);
    }
  };

  const handleSuccess = () => {
    toast.success('Card saved');
    setOpen(false);
    setClientSecret(null);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-1.5'>
          <Plus className='w-4 h-4' /> Add card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a card</DialogTitle>
        </DialogHeader>
        {isLoadingIntent || !clientSecret ? (
          <div className='flex justify-center py-8'>
            <Loader className='w-5 h-5 animate-spin' />
          </div>
        ) : (
          <Elements
            options={{
              clientSecret,
              appearance: {
                theme:
                  theme === 'dark'
                    ? 'night'
                    : theme === 'light'
                    ? 'stripe'
                    : systemTheme === 'light'
                    ? 'stripe'
                    : 'night',
              },
            }}
            stripe={stripePromise}
          >
            <SetupForm onSuccess={handleSuccess} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddCardForm;
