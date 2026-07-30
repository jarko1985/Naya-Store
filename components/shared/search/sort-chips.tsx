import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SortChipsProps {
  sortOrders: string[];
  currentSort: string;
  getHref: (sort: string) => string;
}

const SortChips = ({ sortOrders, currentSort, getHref }: SortChipsProps) => {
  return (
    <div className='flex items-center gap-2 flex-wrap'>
      <span className='text-sm text-muted-foreground'>Sort by</span>
      {sortOrders.map((s) => (
        <Link
          key={s}
          href={getHref(s)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize',
            currentSort === s
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:bg-muted'
          )}
        >
          {s}
        </Link>
      ))}
    </div>
  );
};

export default SortChips;
