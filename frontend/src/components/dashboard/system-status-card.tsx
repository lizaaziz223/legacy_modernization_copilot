'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, RotateCw } from 'lucide-react';
import { healthService } from '@/services';
import type { HealthStatus } from '@/types';
import { Button } from '@/components/ui';

type ConnectionState = 'loading' | 'online' | 'offline';

export function SystemStatusCard() {
  const [state, setState] = useState<ConnectionState>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const checkHealth = () => {
    setState('loading');
    let cancelled = false;

    healthService
      .check()
      .then((data) => {
        if (cancelled) return;
        setHealth(data);
        setState('online');
      })
      .catch(() => {
        if (cancelled) return;
        setState('offline');
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(checkHealth, []);

  return (
    <div className="animate-fade-in-up rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Backend Status</h3>
        {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {state === 'online' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {state === 'offline' && <XCircle className="h-4 w-4 text-destructive" />}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">
            {state === 'loading' && 'Checking connection...'}
            {state === 'online' && `${health?.service ?? 'Service'} is online`}
            {state === 'offline' && 'Unable to reach backend'}
          </p>
          {state === 'online' && health && (
            <p className="text-xs text-muted-foreground">
              v{health.version} · {health.environment} environment
            </p>
          )}
        </div>
        {state === 'offline' && (
          <Button variant="outline" size="sm" onClick={checkHealth}>
            <RotateCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
