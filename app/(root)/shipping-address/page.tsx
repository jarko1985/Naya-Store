import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import ShippingAddressForm from './shipping-address-form';
import CheckoutSteps from '@/components/shared/checkout-steps';
import CheckoutOrderSummary from '@/components/shared/checkout/checkout-order-summary';

export const metadata: Metadata = {
  title: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) throw new Error('No user ID');

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={1} />
      <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
        <div className='md:col-span-2'>
          <ShippingAddressForm address={user.address as ShippingAddress} />
        </div>
        <div>
          <CheckoutOrderSummary cart={cart} />
        </div>
      </div>
    </>
  );
};

export default ShippingAddressPage;
