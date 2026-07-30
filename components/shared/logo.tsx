import Link from 'next/link';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

const SIZES = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl md:text-5xl',
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

const Logo = ({ size = 'md', className }: LogoProps) => {
  return (
    <Link href='/' className={cn('group inline-flex items-center select-none', className)}>
      <span
        className={cn(
          SIZES[size],
          'font-(family-name:--font-fraunces) italic font-semibold tracking-tight leading-[1.35] py-0.5',
          'bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent',
          'bg-[length:200%_auto] bg-left group-hover:bg-right transition-[background-position] duration-700 ease-out'
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
};

export default Logo;
