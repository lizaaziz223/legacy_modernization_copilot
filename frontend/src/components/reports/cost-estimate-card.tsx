import { DollarSign } from 'lucide-react';
import type { CostEstimate } from '@/lib/report';

interface CostEstimateCardProps {
  estimate: CostEstimate | null;
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function CostEstimateCard({ estimate }: CostEstimateCardProps) {
  if (!estimate) {
    return <p className="text-sm text-muted-foreground">Generate a modernization roadmap to see a cost estimate.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
          <DollarSign className="h-4 w-4" />
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {formatUsd(estimate.low)} &ndash; {formatUsd(estimate.high)}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground">Basis</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {estimate.basis.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Rough, AI-generated order-of-magnitude estimate derived from project size and analysis findings &mdash; not a
        quote.
      </p>
    </div>
  );
}
