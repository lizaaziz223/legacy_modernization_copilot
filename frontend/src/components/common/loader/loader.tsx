/**
 * Loader Component
 * Reusable inline loading spinner, e.g. for in-flight button actions.
 */
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface LoaderProps {
  className?: string;
  size?: number;
}

export function Loader({ className, size = 16 }: LoaderProps) {
  return <Loader2 className={cn('animate-spin', className)} size={size} aria-hidden="true" />;
}
