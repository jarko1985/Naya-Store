import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import Menu from '@/components/shared/header/menu';
import MainNav from './main-nav';
import AdminSearch from '@/components/admin/admin-search';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className='flex flex-col'>
        <div className='border-b'>
          <div className='container mx-auto flex items-center gap-3 h-16 px-3 sm:px-4'>
            <Link href='/' className='w-10 shrink-0'>
              <Image
                src='/images/logo.svg'
                height={40}
                width={40}
                alt={APP_NAME}
                className='h-8 w-8 sm:h-10 sm:w-10'
              />
            </Link>
            <MainNav className='shrink-0' />
            <div className='ml-auto flex items-center gap-2 sm:gap-4 min-w-0'>
              <AdminSearch />
              <Menu />
            </div>
          </div>
        </div>

        <div className='flex-1 space-y-4 p-3 sm:p-6 lg:p-8 lg:pt-6 container mx-auto'>
          {children}
        </div>
      </div>
    </>
  );
}
