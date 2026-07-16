import { AlertTriangle } from 'lucide-react';
import type { UnifiedRisk } from '@/lib/executive-summary';

const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  CRITICAL: 'bg-status-critical/10 text-status-critical',
  HIGH: 'bg-status-serious/10 text-status-serious',
  MEDIUM: 'bg-status-warning/10 text-status-warning',
  LOW: 'bg-status-good/10 text-status-good',
};

interface RiskListProps {
  risks: UnifiedRisk[];
}

export function RiskList({ risks }: RiskListProps) {
  if (risks.length === 0) {
    return <p className="text-sm text-muted-foreground">No risks identified from the analyses run so far.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {risks.map((risk, index) => (
        <li key={`${risk.source}-${index}`} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{risk.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  SEVERITY_BADGE_CLASSES[risk.severity] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                {risk.severity}
              </span>
              <span className="text-xs text-muted-foreground">{risk.source}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
