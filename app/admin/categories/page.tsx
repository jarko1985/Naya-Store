import { requireAdmin } from '@/lib/auth-guard';
import { getCategoryTree, getAllCategoriesFlat, deleteCategory } from '@/lib/actions/category.actions';
import { flattenCategoryTree } from '@/lib/utils';
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
import CreateCategoryForm from '@/components/admin/create-category-form';
import DeleteDialog from '@/components/shared/delete-dialog';

const AdminCategoriesPage = async () => {
  await requireAdmin();

  const [tree, flat] = await Promise.all([getCategoryTree(), getAllCategoriesFlat()]);

  const rows = flattenCategoryTree(tree);
  const totalCategories = flat.length;
  const withImage = flat.filter((c) => c.image).length;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Categories</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Create categories and subcategories, and upload an image for each.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>{totalCategories} total</Badge>
          <Badge variant='default'>{withImage} with images</Badge>
        </div>
      </div>

      {/* Create category */}
      <CreateCategoryForm parentOptions={flat} />

      {/* Progress bar */}
      <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
        <div
          className='bg-primary h-2 rounded-full transition-all duration-500'
          style={{
            width: totalCategories > 0 ? `${(withImage / totalCategories) * 100}%` : '0%',
          }}
        />
      </div>
      <p className='text-xs text-muted-foreground'>
        {withImage} of {totalCategories} categories have images
      </p>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CATEGORY NAME</TableHead>
            <TableHead>PRODUCTS</TableHead>
            <TableHead>IMAGE</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ node, depth }) => (
            <TableRow key={node.id}>
              <TableCell className='font-medium'>
                <span style={{ paddingLeft: `${depth * 1.5}rem` }}>
                  {depth > 0 && '— '}
                  {node.name}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{node.productCount} items</Badge>
              </TableCell>
              <TableCell>
                <CategoryImageForm
                  categoryId={node.id}
                  categoryName={node.name}
                  currentImage={node.image}
                />
              </TableCell>
              <TableCell>
                <DeleteDialog id={node.id} action={deleteCategory} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCategoriesPage;
