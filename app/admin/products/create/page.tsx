import { Metadata } from 'next';
import ProductForm from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth-guard';
import { getAllCategories } from '@/lib/actions/product.action';

export const metadata: Metadata = {
  title: 'Create Product',
};

const CreateProductPage = async () => {
  await requireAdmin();
  const rawCategories = await getAllCategories();
  const categories = rawCategories.map((c) => c.category);

  return (
    <div className='max-w-5xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Create Product</h1>
        <p className='text-muted-foreground mt-1'>Add a new product to your store</p>
      </div>
      <ProductForm type='Create' categories={categories} />
    </div>
  );
};

export default CreateProductPage;
