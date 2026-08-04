import { Metadata } from 'next';
import { listSavedPaymentMethods } from '@/lib/actions/payment-method.actions';
import PaymentMethodsList from '@/components/shared/payment/payment-methods-list';
import AddCardForm from '@/components/shared/payment/add-card-form';

export const metadata: Metadata = {
  title: 'Payment Methods',
};

const PaymentMethodsPage = async () => {
  const methods = await listSavedPaymentMethods();

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='h2-bold'>Payment Methods</h2>
        <AddCardForm />
      </div>
      <PaymentMethodsList methods={methods} />
    </div>
  );
};

export default PaymentMethodsPage;
