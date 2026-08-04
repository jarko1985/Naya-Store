import { Metadata } from 'next';
import ProductForm from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth-guard';
import { getAllCategoriesFlat } from '@/lib/actions/category.actions';

export const metadata: Metadata = {
  title: 'Create Product',
};

const CreateProductPage = async () => {
  await requireAdmin();
  const categories = await getAllCategoriesFlat();

  return (
    <div className='max-w-5xl mx-auto'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight'>Create Product</h1>
        <p className='text-sm sm:text-base text-muted-foreground mt-1'>Add a new product to your store</p>
      </div>
      <ProductForm type='Create' categories={categories} />
    </div>
  );
};

export default CreateProductPage;
