import { Progress } from '@/components/ui';

function scoreBarClass(score: number | null): string {
  if (score === null) return 'bg-chart-1';
  if (score >= 75) return 'bg-status-good';
  if (score >= 50) return 'bg-status-warning';
  if (score >= 25) return 'bg-status-serious';
  return 'bg-status-critical';
}

interface ModernizationScoreCardProps {
  score: number | null;
}

/** A hero-style overall modernization score, blending architecture, security, performance, cloud readiness, and maintainability. */
export function ModernizationScoreCard({ score }: ModernizationScoreCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <p className="text-5xl font-extrabold tabular-nums">
        {score !== null ? score : '—'}
        <span className="text-2xl text-muted-foreground">/100</span>
      </p>
      <Progress value={score ?? 0} className="mt-2 w-full max-w-md" indicatorClassName={scoreBarClass(score)} />
      <p className="mt-2 max-w-md text-xs text-muted-foreground">
        A blended estimate of architecture quality, security, performance, cloud readiness, and maintainability -
        computed from the analyses run so far, not a persisted backend value.
      </p>
    </div>
  );
}
