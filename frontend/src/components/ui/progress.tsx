import { cn } from '@/utils';

interface ProgressProps {
  value?: number;
  indeterminate?: boolean;
  className?: string;
  indicatorClassName?: string;
}

/**
 * A minimal shadcn-style progress bar, themeable via indicatorClassName.
 * Pass `indeterminate` for operations with no known duration/percentage
 * (e.g. an AI analysis run) - it sweeps instead of tracking `value`.
 */
export function Progress({ value = 0, indeterminate = false, className, indicatorClassName }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary',
          indeterminate ? 'w-1/3 animate-progress-indeterminate' : 'transition-all',
          indicatorClassName
        )}
        style={indeterminate ? undefined : { width: `${clamped}%` }}
      />
    </div>
  );
}
