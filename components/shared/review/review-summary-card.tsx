import { Star } from 'lucide-react';
import { Review } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewSummaryCardProps {
  reviews: Review[];
  averageRating: number;
  numReviews: number;
}

const ReviewSummaryCard = ({ reviews, averageRating, numReviews }: ReviewSummaryCardProps) => {
  if (numReviews === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className='rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col sm:flex-row gap-6'>
      <div className='flex flex-col items-center justify-center sm:border-r sm:pr-6 sm:min-w-[140px]'>
        <p className='text-4xl font-extrabold'>{averageRating.toFixed(1)}</p>
        <div className='flex items-center gap-0.5 my-1'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          ))}
        </div>
        <p className='text-xs text-muted-foreground'>{numReviews} review{numReviews === 1 ? '' : 's'}</p>
      </div>
      <div className='flex-1 flex flex-col gap-1.5 justify-center'>
        {[5, 4, 3, 2, 1].map((star, idx) => (
          <div key={star} className='flex items-center gap-2 text-xs'>
            <span className='w-8 text-muted-foreground'>{star} star</span>
            <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
              <div
                className='h-full bg-yellow-400 rounded-full'
                style={{ width: `${(counts[idx] / maxCount) * 100}%` }}
              />
            </div>
            <span className='w-6 text-right text-muted-foreground'>{counts[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummaryCard;
