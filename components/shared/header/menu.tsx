import { Button } from '@/components/ui/button';
import ModeToggle from './mode-toggle';
import Link from 'next/link';
import { EllipsisVertical, ShoppingCart, UserIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from './user-button';

const Menu = () => {
  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <ModeToggle />
        <Button asChild variant='ghost'>
          <Link href='/cart'>
            <ShoppingCart /> Cart
          </Link>
        </Button>
       <UserButton />
        {/* <UserButton /> */}
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger
            className='flex size-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
            aria-label='Open menu'
          >
            <EllipsisVertical className='size-5' />
          </SheetTrigger>
          <SheetContent className='flex flex-col gap-0 p-0'>
            <SheetHeader className='border-b border-neutral-200 px-5 py-4'>
              <SheetTitle className='text-left text-lg font-semibold'>
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className='flex flex-1 flex-col overflow-y-auto'>
              <div className='flex flex-col py-2'>
                <Button
                  asChild
                  variant='ghost'
                  className='h-12 justify-start gap-3 rounded-none px-5 py-3 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                >
                  <Link href='/cart' className='flex items-center gap-3'>
                    <ShoppingCart className='size-5 shrink-0' />
                    Cart
                  </Link>
                </Button>
              </div>
              <div className='border-t border-neutral-200 py-2 inline-flex items-center'>
               
                <ModeToggle />
                <p className='mb-0 text-xs font-medium uppercase tracking-wider text-neutral-500'>
                  Theme
                </p>
              </div>
              <div className='border-t border-neutral-200 py-2'/>
            </div>
            <div className='border-t border-neutral-200 p-4'>
              <UserButton />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;