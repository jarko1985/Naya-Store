import { requireAdmin } from '@/lib/auth-guard';
import { getAllCategories } from '@/lib/actions/product.action';
import { getAllCategoryMeta } from '@/lib/actions/category.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CategoryImageForm from '@/components/admin/category-image-form';

const AdminCategoriesPage = async () => {
  await requireAdmin();

  const [categories, categoryMeta] = await Promise.all([
    getAllCategories(),
    getAllCategoryMeta(),
  ]);

  const metaMap = Object.fromEntries(
    categoryMeta.map((m) => [m.name, m.image])
  );

  const withImage = categories.filter((c) => metaMap[c.category]).length;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex-between'>
        <div>
          <h1 className='h2-bold'>Categories</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Upload an image for each category to display on the storefront.
            Categories are automatically derived from your products.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>{categories.length} total</Badge>
          <Badge variant='default'>{withImage} with images</Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
        <div
          className='bg-primary h-2 rounded-full transition-all duration-500'
          style={{
            width:
              categories.length > 0
                ? `${(withImage / categories.length) * 100}%`
                : '0%',
          }}
        />
      </div>
      <p className='text-xs text-muted-foreground'>
        {withImage} of {categories.length} categories have images
      </p>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CATEGORY NAME</TableHead>
            <TableHead>PRODUCTS</TableHead>
            <TableHead>IMAGE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(({ category, _count }) => (
            <TableRow key={category}>
              <TableCell className='font-medium'>{category}</TableCell>
              <TableCell>
                <Badge variant='outline'>{_count} items</Badge>
              </TableCell>
              <TableCell>
                <CategoryImageForm
                  categoryName={category}
                  currentImage={metaMap[category]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCategoriesPage;
