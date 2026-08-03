'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { ShippingAddress } from '@/types';
import { shippingAddressSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { ControllerRenderProps, useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader, MapPin, User2, Home, Hash, Globe2, Lock, Mail } from 'lucide-react';
import { updateUserAddress } from '@/lib/actions/user.actions';
import { shippingAddressDefaultValues } from '@/lib/constants';

const IconInput = ({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ElementType }) => (
  <div className='relative'>
    <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
    <Input className='pl-9' {...props} />
  </div>
);

const ShippingAddressForm = ({
  address,
  isGuest = false,
}: {
  address: ShippingAddress;
  isGuest?: boolean;
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (
    values
  ) => {
    if (isGuest && !values.email) {
      form.setError('email', { message: 'Email is required' });
      return;
    }

    startTransition(async () => {
      const res = await updateUserAddress(values);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.push('/payment-method');
    });
  };

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-6 md:p-8'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border shadow-sm'>
            <MapPin className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold'>Shipping Address</h1>
            <p className='text-sm text-muted-foreground'>Where should we send your order?</p>
          </div>
        </div>

        <Form {...form}>
          <form
            method='post'
            className='space-y-5'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {isGuest && (
              <FormField
                control={form.control}
                name='email'
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    z.infer<typeof shippingAddressSchema>,
                    'email'
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <IconInput
                        icon={Mail}
                        type='email'
                        placeholder='Enter your email'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='fullName'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'fullName'
                >;
              }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <IconInput icon={User2} placeholder='Enter full name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='streetAddress'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'streetAddress'
                >;
              }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <IconInput icon={Home} placeholder='Street address, apartment, building' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <FormField
                control={form.control}
                name='city'
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    z.infer<typeof shippingAddressSchema>,
                    'city'
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <IconInput icon={MapPin} placeholder='Enter city' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='postalCode'
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    z.infer<typeof shippingAddressSchema>,
                    'postalCode'
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <IconInput icon={Hash} placeholder='Enter postal code' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='country'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'country'
                >;
              }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <IconInput icon={Globe2} placeholder='Enter country' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isPending} className='w-full h-11 mt-2'>
              {isPending ? (
                <Loader className='w-4 h-4 animate-spin' />
              ) : (
                <ArrowRight className='w-4 h-4' />
              )}{' '}
              Continue to Payment
            </Button>

            <p className='flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
              <Lock className='w-3 h-3' />
              Your information is encrypted and secure
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;
