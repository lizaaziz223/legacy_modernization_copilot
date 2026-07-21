import { Skeleton } from './skeleton';

interface CardGridSkeletonProps {
  count?: number;
}

/** Mirrors ProjectCard's shape - icon tile, title/date lines, two stat chips. */
export function CardGridSkeleton({ count = 6 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PanelSkeletonProps {
  lines?: number;
}

/** A generic analysis-panel-shaped placeholder: a few text lines plus a larger content block. */
export function PanelSkeleton({ lines = 3 }: PanelSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={index === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'} />
      ))}
      <Skeleton className="mt-2 h-24 w-full" />
    </div>
  );
}
