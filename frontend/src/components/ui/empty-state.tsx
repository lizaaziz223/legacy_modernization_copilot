import * as React from 'react';
import { cn } from '@/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** A consistent empty-state card: illustration, title, description, and an optional action. */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ illustration, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-fade-in-up flex flex-col items-center gap-5 rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center',
        className
      )}
      {...props}
    >
      {illustration}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
