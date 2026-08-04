import Link from 'next/link';
import { getAllProducts, deleteProduct } from '@/lib/actions/product.action';
import { formatCurrency, formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import { requireAdmin } from '@/lib/auth-guard';
import { Product } from '@/types';

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';
  const category = searchParams.category || '';

  const products = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <div className='space-y-2'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Products</h1>
          {searchText && (
            <div className='text-sm'>
              Filtered by <i>&quot;{searchText}&quot;</i>{' '}
              <Link href='/admin/products'>
                <Button variant='outline' size='sm'>
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild variant='default' className='w-full sm:w-auto'>
          <Link href='/admin/products/create'>Create Product</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='hidden sm:table-cell'>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className='text-right'>PRICE</TableHead>
            <TableHead className='hidden sm:table-cell'>CATEGORY</TableHead>
            <TableHead className='hidden md:table-cell'>STOCK</TableHead>
            <TableHead className='hidden lg:table-cell'>RATING</TableHead>
            <TableHead className='w-[100px]'>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data.map((product: Product) => (
            <TableRow key={product.id}>
              <TableCell className='hidden sm:table-cell'>{formatId(product.id)}</TableCell>
              <TableCell className='max-w-40 truncate sm:max-w-none sm:whitespace-nowrap'>
                {product.name}
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className='hidden sm:table-cell'>{product.category?.name}</TableCell>
              <TableCell className='hidden md:table-cell'>{product.stock}</TableCell>
              <TableCell className='hidden lg:table-cell'>{product.rating}</TableCell>
              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {products.totalPages > 1 && (
        <Pagination page={page} totalPages={products.totalPages} />
      )}
    </div>
  );
};

export default AdminProductsPage;