import Image from 'next/image';
import { Caveat_Brush } from "next/font/google";
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';
import CategoryDrawer from './category-drawer';
import Search from './search';

const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  variable: "--font-caveat-brush",
  weight: "400",
});


const Header = () => {
  return (
    <header className='w-full border-b'>
      <div className='wrapper flex-between'>
        <div className='flex-start'>
          <CategoryDrawer />
          <Link href='/' className='flex-start ml-4'>
            {/* <Image
              src='/images/logo/logo_256.svg'
              alt={`${APP_NAME} logo`}
              height={200}
              width={200}
              priority={true}
            /> */}
            <span className={`${caveatBrush.className} text-2xl font-bold`}>{APP_NAME}</span>
          </Link>
        </div>
        <div className='hidden md:block'>
          <Search />
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;