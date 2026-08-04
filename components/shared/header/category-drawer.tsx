import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { getCategoryTree } from '@/lib/actions/category.actions';
import { flattenCategoryTree } from '@/lib/utils';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';

const CategoryDrawer = async () => {
  const tree = await getCategoryTree();
  const rows = flattenCategoryTree(tree);

  return (
    <Drawer direction='left'>
      <DrawerTrigger asChild>
        <Button variant='outline'>
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='h-full max-w-sm'>
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className='space-y-1 mt-4'>
            {rows.map(({ node, depth }) => (
              <Button
                variant='ghost'
                className='w-full justify-start'
                style={{ paddingLeft: `${1 + depth * 1.25}rem` }}
                key={node.id}
                asChild
              >
                <DrawerClose asChild>
                  <Link href={`/search?category=${node.slug}`}>
                    {depth > 0 && '— '}
                    {node.name} ({node.productCount})
                  </Link>
                </DrawerClose>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDrawer;