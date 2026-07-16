import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/utils';
import type { MetricAccent } from '@/components/dashboard';

const ACCENT_ICON_CLASSES: Record<MetricAccent, string> = {
  'chart-1': 'bg-chart-1/10 text-chart-1',
  'chart-2': 'bg-chart-2/10 text-chart-2',
  'chart-3': 'bg-chart-3/10 text-chart-3',
  'chart-5': 'bg-chart-5/10 text-chart-5',
  'chart-8': 'bg-chart-8/10 text-chart-8',
  good: 'bg-status-good/10 text-status-good',
  warning: 'bg-status-warning/10 text-status-warning',
  serious: 'bg-status-serious/10 text-status-serious',
  critical: 'bg-status-critical/10 text-status-critical',
};

interface InfoCardProps {
  label: string;
  icon: LucideIcon;
  accent: MetricAccent;
  children: ReactNode;
  animationDelayMs?: number;
}

/** A colorful card for non-numeric Executive Summary facts (domain, stack, architecture, ...). */
export function InfoCard({ label, icon: Icon, accent, children, animationDelayMs = 0 }: InfoCardProps) {
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${animationDelayMs}ms` }}>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', ACCENT_ICON_CLASSES[accent])}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        <div className="text-sm">{children}</div>
      </CardContent>
    </Card>
  );
}
