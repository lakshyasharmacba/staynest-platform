/**
 * ListingCardSkeleton:
 * Displays a pulsing placeholder card matching ListingCard layout while data is fetching.
 * Prevents Cumulative Layout Shift (CLS) and eliminates blank loading screens.
 */
export default function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Image Skeleton */}
      <div className="h-48 w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      
      {/* Content Skeleton */}
      <div className="space-y-2.5 p-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
