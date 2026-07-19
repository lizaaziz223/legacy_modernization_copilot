import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/utils';

export type MetricAccent =
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-5'
  | 'chart-8'
  | 'good'
  | 'warning'
  | 'serious'
  | 'critical';

const ACCENT_CLASSES: Record<MetricAccent, string> = {
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

/** Maps a 0-100 "higher is better" score to a semantic status accent. */
export function scoreAccent(score: number | null): MetricAccent {
  if (score === null) return 'chart-1';
  if (score >= 75) return 'good';
  if (score >= 50) return 'warning';
  if (score >= 25) return 'serious';
  return 'critical';
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: MetricAccent;
  hint?: string;
  animationDelayMs?: number;
}

/**
 * A single Executive Dashboard top-row metric. Score-based metrics use a
 * semantic status accent (good/warning/serious/critical); count-based
 * metrics use a fixed categorical accent for visual variety without
 * implying good/bad.
 */
export function MetricCard({ label, value, icon: Icon, accent, hint, animationDelayMs = 0 }: MetricCardProps) {
  return (
    <Card
      className="animate-fade-in-up transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', ACCENT_CLASSES[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-bold tabular-nums">{value}</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
