'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Address } from '@/types';
import { deleteAddress, setDefaultAddress } from '@/lib/actions/address.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import AddressFormDialog from './address-form-dialog';
import { Trash2 } from 'lucide-react';

const AddressList = ({ addresses }: { addresses: Address[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const res = await setDefaultAddress(id);
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
      const res = await deleteAddress(id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    });
  };

  if (addresses.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        You haven&apos;t saved any addresses yet.
      </p>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className='p-4 space-y-2'>
            <div className='flex items-start justify-between gap-2'>
              <div className='font-medium'>
                {address.label || address.fullName}
              </div>
              {address.isDefault && <Badge variant='secondary'>Default</Badge>}
            </div>
            <div className='text-sm text-muted-foreground'>
              <p>{address.fullName}</p>
              <p>{address.streetAddress}</p>
              <p>
                {address.city}, {address.postalCode}
              </p>
              <p>{address.country}</p>
            </div>
            <div className='flex items-center gap-2 pt-2'>
              <AddressFormDialog
                address={address}
                trigger={
                  <Button variant='outline' size='sm'>
                    Edit
                  </Button>
                }
              />
              {!address.isDefault && (
                <Button
                  variant='outline'
                  size='sm'
                  disabled={isPending}
                  onClick={() => handleSetDefault(address.id)}
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
                    <AlertDialogTitle>Delete this address?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This can&apos;t be undone. It won&apos;t affect any past orders.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(address.id)}>
                      Delete
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

export default AddressList;
