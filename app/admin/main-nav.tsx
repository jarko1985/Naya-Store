'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const links = [
  {
    title: 'Overview',
    href: '/admin/overview',
  },
  {
    title: 'Products',
    href: '/admin/products',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
  },
  {
    title: 'Returns',
    href: '/admin/returns',
  },
  {
    title: 'Coupons',
    href: '/admin/coupons',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
];

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav
        className={cn('hidden lg:flex items-center space-x-4 xl:space-x-6', className)}
        {...props}
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
              pathname.includes(item.href) ? '' : 'text-muted-foreground'
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Mobile / tablet hamburger nav */}
      <div className='lg:hidden'>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className='flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label='Open admin menu'
          >
            <MenuIcon className='size-5' />
          </SheetTrigger>
          <SheetContent side='left' className='flex flex-col gap-0 p-0 w-3/4 max-w-xs'>
            <SheetHeader className='border-b px-5 py-4'>
              <SheetTitle className='text-left text-lg font-semibold'>
                Admin Menu
              </SheetTitle>
            </SheetHeader>
            <nav className='flex flex-1 flex-col overflow-y-auto py-2'>
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-5 py-3 text-sm font-medium transition-colors hover:bg-muted',
                    pathname.includes(item.href)
                      ? 'text-foreground bg-muted/60'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MainNav;
