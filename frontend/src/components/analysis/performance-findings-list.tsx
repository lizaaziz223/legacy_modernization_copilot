import { Gauge } from 'lucide-react';
import type { PerformanceFinding } from '@/types';

interface PerformanceFindingsListProps {
  findings: PerformanceFinding[];
}

export function PerformanceFindingsList({ findings }: PerformanceFindingsListProps) {
  if (findings.length === 0) {
    return <p className="text-sm text-muted-foreground">No performance findings were reported.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {findings.map((finding, index) => (
        <li key={index} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-chart-1/10 px-2 py-0.5 text-xs font-medium text-chart-1">
              <Gauge className="h-3 w-3" />
              {finding.issueType.replace(/_/g, ' ')}
            </span>
            {finding.location && <span className="text-xs text-muted-foreground">{finding.location}</span>}
          </div>
          <p className="mt-2 text-sm font-medium">{finding.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{finding.description}</p>
          {finding.optimizationSuggestion && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Optimization: </span>
              {finding.optimizationSuggestion}
            </p>
          )}
          {finding.modernAlternative && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium">Modern alternative: </span>
              {finding.modernAlternative}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
