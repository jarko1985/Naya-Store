import { Metadata } from 'next';
import { listAddresses } from '@/lib/actions/address.actions';
import AddressList from '@/components/shared/address/address-list';
import AddressFormDialog from '@/components/shared/address/address-form-dialog';
import { Address } from '@/types';

export const metadata: Metadata = {
  title: 'My Addresses',
};

const AddressesPage = async () => {
  const addresses = await listAddresses();

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='h2-bold'>Addresses</h2>
        <AddressFormDialog />
      </div>
      <AddressList addresses={addresses as Address[]} />
    </div>
  );
};

export default AddressesPage;
