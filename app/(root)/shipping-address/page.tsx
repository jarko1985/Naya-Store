import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { listAddresses } from '@/lib/actions/address.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Address, ShippingAddress } from '@/types';
import ShippingAddressForm from './shipping-address-form';
import AddressSelector from './address-selector';
import CheckoutSteps from '@/components/shared/checkout-steps';
import CheckoutOrderSummary from '@/components/shared/checkout/checkout-order-summary';
import { shippingAddressDefaultValues } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;
  const user = userId ? await getUserById(userId) : null;
  const isGuest = !user || user.isGuest;

  const addresses = isGuest ? [] : ((await listAddresses()) as Address[]);

  return (
    <>
      <CheckoutSteps current={1} />
      <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
        <div className='md:col-span-2'>
          {addresses.length > 0 ? (
            <AddressSelector
              addresses={addresses}
              currentAddress={(user?.address as ShippingAddress) ?? null}
            />
          ) : (
            <ShippingAddressForm
              address={(user?.address as ShippingAddress) ?? shippingAddressDefaultValues}
              isGuest={isGuest}
            />
          )}
        </div>
        <div>
          <CheckoutOrderSummary cart={cart} />
        </div>
      </div>
    </>
  );
};

export default ShippingAddressPage;
