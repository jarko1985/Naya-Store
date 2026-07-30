import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionHref, className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border bg-card shadow-sm',
        className
      )}
    >
      <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border shadow-sm'>
        <Icon className='w-7 h-7 text-muted-foreground' strokeWidth={1.5} />
      </div>
      <h2 className='text-lg font-semibold'>{title}</h2>
      {description && <p className='text-sm text-muted-foreground mt-1 max-w-sm'>{description}</p>}
      {actionLabel && actionHref && (
        <Button asChild className='mt-6'>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
