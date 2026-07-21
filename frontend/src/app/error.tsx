'use client';

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-fade-in-up rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold text-destructive">Something went wrong!</h2>
        <p className="mb-6 text-destructive/80">{error.message}</p>
        <Button variant="destructive" onClick={() => reset()}>
          <RotateCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
