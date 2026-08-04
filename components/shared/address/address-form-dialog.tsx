'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { addressSchema } from '@/lib/validators';
import { createAddress, updateAddress } from '@/lib/actions/address.actions';
import { Address } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader, Plus } from 'lucide-react';

type FormValues = z.infer<typeof addressSchema>;

const AddressFormDialog = ({
  address,
  trigger,
}: {
  address?: Address;
  trigger?: React.ReactNode;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [makeDefault, setMakeDefault] = useState(address?.isDefault ?? false);

  const form = useForm<FormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? '',
      fullName: address?.fullName ?? '',
      streetAddress: address?.streetAddress ?? '',
      city: address?.city ?? '',
      postalCode: address?.postalCode ?? '',
      country: address?.country ?? '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = address
        ? await updateAddress(address.id, { ...values, isDefault: makeDefault })
        : await createAddress({ ...values, isDefault: makeDefault });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setOpen(false);
      form.reset();
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant='outline' className='gap-1.5'>
            <Plus className='w-4 h-4' /> Add address
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{address ? 'Edit address' : 'Add address'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Home, Work, ...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='streetAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-center gap-2'>
              <Checkbox
                id='isDefault'
                checked={makeDefault}
                onCheckedChange={(checked) => setMakeDefault(checked === true)}
              />
              <Label htmlFor='isDefault' className='font-normal'>
                Set as default address
              </Label>
            </div>
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader className='w-4 h-4 animate-spin' />}
                {address ? 'Save changes' : 'Add address'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormDialog;
