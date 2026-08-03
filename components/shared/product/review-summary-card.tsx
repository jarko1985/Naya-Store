import Rating from "./rating";

interface ReviewSnippet {
  id: string;
  rating: number;
  title: string;
  description: string;
  isVerifiedPurchase?: boolean;
  user?: { name: string } | null;
}

interface ReviewSummaryCardProps {
  rating: number;
  numReviews: number;
  reviews: ReviewSnippet[];
}

const ReviewSummaryCard = ({
  rating,
  numReviews,
  reviews,
}: ReviewSummaryCardProps) => {
  if (numReviews === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border overflow-hidden">
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Be the first to share your thoughts on this product.
          </p>
          <a
            href="#reviews"
            className="inline-block mt-3 text-xs font-medium text-primary hover:underline underline-offset-2"
          >
            Write a review →
          </a>
        </div>
      </div>
    );
  }

  const counts = [0, 0, 0, 0, 0]; // counts[0] = 1-star ... counts[4] = 5-star
  reviews.forEach((r) => {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    counts[idx]++;
  });
  const total = reviews.length || numReviews;

  const topReviews = reviews.slice(0, 2);

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <p className="text-sm font-semibold">Customer Ratings</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Overall score */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold">{rating.toFixed(1)}</span>
          <div>
            <Rating value={rating} />
            <p className="text-xs text-muted-foreground mt-0.5">
              {numReviews} review{numReviews === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Star distribution */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star - 1];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-muted-foreground">{star}★</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recent review snippets */}
        {topReviews.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            {topReviews.map((review) => (
              <div key={review.id}>
                <div className="flex items-center gap-2">
                  <Rating value={review.rating} />
                  {review.isVerifiedPurchase && (
                    <span className="text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium mt-1 line-clamp-1">
                  {review.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {review.description}
                </p>
                {review.user?.name && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    — {review.user.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <a
          href="#reviews"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-2"
        >
          Read all {numReviews} review{numReviews === 1 ? "" : "s"} →
        </a>
      </div>
    </div>
  );
};

export default ReviewSummaryCard;
