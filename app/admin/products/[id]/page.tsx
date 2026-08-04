import ProductForm from '@/components/admin/product-form';
import ProductVariantsManager from '@/components/admin/product-variants-manager';
import { getProductById } from '@/lib/actions/product.action';
import { getAllCategoriesFlat } from '@/lib/actions/category.actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-guard';
import { Product, ProductVariant } from '@/types';

export const metadata: Metadata = {
  title: 'Update Product',
};

const AdminProductUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategoriesFlat(),
  ]);

  if (!product) return notFound();

  return (
    <div className='space-y-6 sm:space-y-8 max-w-5xl mx-auto'>
      <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Update Product</h1>

      <ProductForm type='Update' product={product as unknown as Product} productId={product.id} categories={categories} />

      <ProductVariantsManager
        productId={product.id}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialVariants={((product as any).variants as ProductVariant[]) ?? []}
      />
    </div>
  );
};

export default AdminProductUpdatePage;
