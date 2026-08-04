import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/actions/user.actions';
import { getMyCart } from '@/lib/actions/cart.actions';
import PaymentMethodForm from './payment-method-form';
import CheckoutSteps from '@/components/shared/checkout-steps';
import CheckoutOrderSummary from '@/components/shared/checkout/checkout-order-summary';
import { getActiveCurrency } from '@/lib/currency';

export const metadata: Metadata = {
  title: 'Select Payment Method',
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User not found');

  const user = await getUserById(userId);
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');
  if (!user.address) redirect('/shipping-address');

  const activeCurrency = await getActiveCurrency();

  return (
    <>
      <CheckoutSteps current={2} />
      <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
        <div className='md:col-span-2'>
          <PaymentMethodForm
            preferredPaymentMethod={user.paymentMethod}
            activeCurrency={activeCurrency}
          />
        </div>
        <div>
          <CheckoutOrderSummary cart={cart} />
        </div>
      </div>
    </>
  );
};

export default PaymentMethodPage;
