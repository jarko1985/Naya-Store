import { Mail } from 'lucide-react';
import NewsletterForm from '@/components/shared/footer/newsletter-form';

const NewsletterSection = () => {
  return (
    <section className='relative mb-12 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-indigo-500/5 to-violet-500/10 shadow-sm px-6 py-10 md:py-14 flex flex-col items-center text-center'>
      <div className='absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none' />
      <div className='relative z-10 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 border shadow-sm'>
        <Mail className='w-5 h-5' />
      </div>
      <h2 className='relative z-10 text-2xl md:text-3xl font-bold mb-2'>Get 10% off your first order</h2>
      <p className='relative z-10 text-sm text-muted-foreground max-w-md mb-6'>
        Subscribe for early access to new arrivals, exclusive deals, and style inspiration — straight to your inbox.
      </p>
      <div className='relative z-10 w-full max-w-sm'>
        <NewsletterForm source='homepage' className='shadow-sm rounded-lg overflow-hidden' />
      </div>
    </section>
  );
};

export default NewsletterSection;
