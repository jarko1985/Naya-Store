'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  SavedPaymentMethod,
  deleteSavedPaymentMethod,
  setDefaultPaymentMethod,
} from '@/lib/actions/payment-method.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PaymentMethodsList = ({ methods }: { methods: SavedPaymentMethod[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const res = await setDefaultPaymentMethod(id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteSavedPaymentMethod(id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    });
  };

  if (methods.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        You haven&apos;t saved any cards yet.
      </p>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {methods.map((method) => (
        <Card key={method.id}>
          <CardContent className='p-4 space-y-3'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <CreditCard className='w-4 h-4 text-muted-foreground' />
                <span className='font-medium capitalize'>{method.brand}</span>
                <span className='text-muted-foreground'>&bull;&bull;&bull;&bull; {method.last4}</span>
              </div>
              {method.isDefault && <Badge variant='secondary'>Default</Badge>}
            </div>
            <p className='text-sm text-muted-foreground'>
              Expires {String(method.expMonth).padStart(2, '0')}/{method.expYear}
            </p>
            <div className='flex items-center gap-2'>
              {!method.isDefault && (
                <Button
                  variant='outline'
                  size='sm'
                  disabled={isPending}
                  onClick={() => handleSetDefault(method.id)}
                >
                  Set as default
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='ghost' size='sm' disabled={isPending}>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove this card?</AlertDialogTitle>
                    <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(method.id)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PaymentMethodsList;
