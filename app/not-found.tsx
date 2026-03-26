'use client';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import FuzzyText from '@/components/FuzzyText';
import { useTheme } from 'next-themes';

const NotFoundPage = () => {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000';

  return (
    <div className='flex flex-col space-y-6 items-center justify-start mt-20 h-fit'>
        <Image src='/images/logo/logo_256.svg' alt='404 Not Found' width={300} height={300} className='mx-auto' />
        <FuzzyText color={textColor} baseIntensity={0.2} hoverIntensity={0.3} enableHover className='block mx-auto'>404</FuzzyText>
        <FuzzyText color={textColor} fontSize='3rem' baseIntensity={0.2} hoverIntensity={0.3} enableHover className='block mx-auto'>Page Not Found</FuzzyText>
        <Button variant='outline' className='mt-4 ml-2' asChild>
          <Link href='/'>Back To Home</Link>
        </Button>
    </div>
  );
};

export default NotFoundPage;