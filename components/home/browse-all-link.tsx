'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BrowseAllLink = () => {
  return (
    <Link
      href='/search'
      className='group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold'
    >
      <span className='bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-flow'>
        Browse all
      </span>
      <ArrowRight className='w-4 h-4 text-fuchsia-400 transition-transform duration-300 group-hover:translate-x-1.5' />
    </Link>
  );
};

export default BrowseAllLink;
