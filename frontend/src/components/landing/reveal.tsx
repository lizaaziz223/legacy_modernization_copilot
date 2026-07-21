'use client';

import type { ReactNode } from 'react';
import { useInView } from '@/hooks';
import { cn } from '@/utils';

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

/** Fades and slides children in once they scroll into view. */
export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(!isInView && 'opacity-0', isInView && 'animate-fade-in-up', className)}
      style={isInView ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
