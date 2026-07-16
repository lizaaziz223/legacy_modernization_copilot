import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, Progress } from '@/components/ui';
import { cn } from '@/utils';
import type { MetricAccent } from '@/components/dashboard';

const ACCENT_CLASSES: Record<MetricAccent, { icon: string; bar: string }> = {
  'chart-1': { icon: 'bg-chart-1/10 text-chart-1', bar: 'bg-chart-1' },
  'chart-2': { icon: 'bg-chart-2/10 text-chart-2', bar: 'bg-chart-2' },
  'chart-3': { icon: 'bg-chart-3/10 text-chart-3', bar: 'bg-chart-3' },
  'chart-5': { icon: 'bg-chart-5/10 text-chart-5', bar: 'bg-chart-5' },
  'chart-8': { icon: 'bg-chart-8/10 text-chart-8', bar: 'bg-chart-8' },
  good: { icon: 'bg-status-good/10 text-status-good', bar: 'bg-status-good' },
  warning: { icon: 'bg-status-warning/10 text-status-warning', bar: 'bg-status-warning' },
  serious: { icon: 'bg-status-serious/10 text-status-serious', bar: 'bg-status-serious' },
  critical: { icon: 'bg-status-critical/10 text-status-critical', bar: 'bg-status-critical' },
};

interface ScoreCardProps {
  label: string;
  score: number | null;
  icon: LucideIcon;
  accent: MetricAccent;
  description?: string;
  animationDelayMs?: number;
}

/** A colorful scorecard with a progress bar, for the Executive Summary's numeric metrics. */
export function ScoreCard({ label, score, icon: Icon, accent, description, animationDelayMs = 0 }: ScoreCardProps) {
  const classes = ACCENT_CLASSES[accent];
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${animationDelayMs}ms` }}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', classes.icon)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-bold tabular-nums">{score !== null ? `${score}/100` : '—'}</p>
          </div>
        </div>
        {score !== null && (
          <Progress value={score} className="mt-3" indicatorClassName={classes.bar} />
        )}
        {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
