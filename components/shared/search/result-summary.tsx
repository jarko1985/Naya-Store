import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveFilter {
  label: string;
  clearHref: string;
}

interface ResultSummaryProps {
  resultCount: number;
  query?: string;
  activeFilters: ActiveFilter[];
  clearAllHref: string;
}

const ResultSummary = ({ resultCount, query, activeFilters, clearAllHref }: ResultSummaryProps) => {
  const hasFilters = activeFilters.length > 0;

  return (
    <div className='flex flex-col gap-2'>
      <p className='text-sm text-muted-foreground'>
        <span className='font-medium text-foreground'>{resultCount}</span>{' '}
        {resultCount === 1 ? 'result' : 'results'}
        {query && query !== 'all' && query !== '' && (
          <>
            {' '}
            for <span className='font-medium text-foreground'>&quot;{query}&quot;</span>
          </>
        )}
      </p>
      {hasFilters && (
        <div className='flex items-center gap-2 flex-wrap'>
          {activeFilters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.clearHref}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                'bg-muted text-muted-foreground hover:bg-muted/70 transition-colors'
              )}
            >
              {filter.label}
              <X className='w-3 h-3' />
            </Link>
          ))}
          <Link href={clearAllHref} className='text-xs text-primary underline underline-offset-2'>
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
};

export default ResultSummary;
