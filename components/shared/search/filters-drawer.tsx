import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const FiltersDrawer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm' className='md:hidden gap-2'>
          <SlidersHorizontal className='w-4 h-4' />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='overflow-y-auto p-4'>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className='mt-2'>{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default FiltersDrawer;
