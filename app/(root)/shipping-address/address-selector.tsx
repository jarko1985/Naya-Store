'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Address, ShippingAddress } from '@/types';
import { updateUserAddress } from '@/lib/actions/user.actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Loader, MapPin, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shippingAddressDefaultValues } from '@/lib/constants';
import ShippingAddressForm from './shipping-address-form';

const findMatchingAddressId = (addresses: Address[], current: ShippingAddress | null) => {
  if (!current) return null;
  const match = addresses.find(
    (a) =>
      a.fullName === current.fullName &&
      a.streetAddress === current.streetAddress &&
      a.city === current.city &&
      a.postalCode === current.postalCode &&
      a.country === current.country
  );
  return match?.id ?? null;
};

const AddressSelector = ({
  addresses,
  currentAddress,
}: {
  addresses: Address[];
  currentAddress: ShippingAddress | null;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addingNew, setAddingNew] = useState(false);

  const defaultSelectedId =
    findMatchingAddressId(addresses, currentAddress) ??
    addresses.find((a) => a.isDefault)?.id ??
    addresses[0].id;
  const [selectedId, setSelectedId] = useState(defaultSelectedId);

  if (addingNew) {
    return (
      <div className='space-y-4'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-1.5'
          onClick={() => setAddingNew(false)}
        >
          Back to saved addresses
        </Button>
        <ShippingAddressForm address={shippingAddressDefaultValues} isGuest={false} />
      </div>
    );
  }

  const handleContinue = () => {
    if (!selectedId) return;

    startTransition(async () => {
      const res = await updateUserAddress({ addressId: selectedId });

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
            <p className='text-sm text-muted-foreground'>Choose where to send your order</p>
          </div>
        </div>

        <RadioGroup
          value={selectedId ?? undefined}
          onValueChange={setSelectedId}
          className='flex flex-col gap-3 mb-5'
        >
          {addresses.map((address) => {
            const isSelected = selectedId === address.id;

            return (
              <label
                key={address.id}
                htmlFor={address.id}
                className={cn(
                  'relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold flex items-center gap-2'>
                    {address.label || address.fullName}
                    {address.isDefault && (
                      <span className='text-xs font-normal text-muted-foreground'>(Default)</span>
                    )}
                  </p>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {address.fullName} &middot; {address.streetAddress}, {address.city},{' '}
                    {address.postalCode}, {address.country}
                  </p>
                </div>
                {isSelected && (
                  <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                    <Check className='w-3 h-3' />
                  </span>
                )}
                <RadioGroupItem id={address.id} value={address.id} className='sr-only' />
              </label>
            );
          })}
        </RadioGroup>

        <Button
          type='button'
          variant='outline'
          className='gap-1.5 w-full mb-5'
          onClick={() => setAddingNew(true)}
        >
          <Plus className='w-4 h-4' /> Add new address
        </Button>

        <Button
          type='button'
          className='w-full h-11'
          disabled={isPending || !selectedId}
          onClick={handleContinue}
        >
          {isPending ? (
            <Loader className='w-4 h-4 animate-spin' />
          ) : (
            <ArrowRight className='w-4 h-4' />
          )}{' '}
          Continue to Payment
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddressSelector;
