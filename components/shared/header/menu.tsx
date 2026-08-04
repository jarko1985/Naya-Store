import { Button } from '@/components/ui/button';
import ModeToggle from './mode-toggle';
import CurrencySwitcher from '@/components/shared/currency/currency-switcher';
import Link from 'next/link';
import { EllipsisVertical, ShoppingCart, UserIcon, Heart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from './user-button';

const Menu = ({ cartCount = 0 }: { cartCount?: number }) => {
  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <ModeToggle />
        <CurrencySwitcher />
        <Button asChild variant='ghost'>
          <Link href='/cart' className='relative'>
            <ShoppingCart /> Cart
            {cartCount > 0 && (
              <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground'>
                {cartCount}
              </span>
            )}
          </Link>
        </Button>
        <Button asChild variant='ghost'>
          <Link href='/wishlist'>
            <Heart /> Wishlist
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
                    {cartCount > 0 && (
                      <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground'>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='ghost'
                  className='h-12 justify-start gap-3 rounded-none px-5 py-3 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                >
                  <Link href='/wishlist' className='flex items-center gap-3'>
                    <Heart className='size-5 shrink-0' />
                    Wishlist
                  </Link>
                </Button>
              </div>
              <div className='border-t border-neutral-200 py-2 inline-flex items-center'>

                <ModeToggle />
                <p className='mb-0 text-xs font-medium uppercase tracking-wider text-neutral-500'>
                  Theme
                </p>
              </div>
              <div className='border-t border-neutral-200 py-2 inline-flex items-center gap-2 px-1'>
                <CurrencySwitcher />
                <p className='mb-0 text-xs font-medium uppercase tracking-wider text-neutral-500'>
                  Currency
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