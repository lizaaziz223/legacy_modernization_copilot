import { AlertTriangle } from 'lucide-react';
import type { SecurityFinding } from '@/types';

const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  CRITICAL: 'bg-status-critical/10 text-status-critical',
  HIGH: 'bg-status-serious/10 text-status-serious',
  MEDIUM: 'bg-status-warning/10 text-status-warning',
  LOW: 'bg-status-good/10 text-status-good',
};

interface SecurityFindingsListProps {
  findings: SecurityFinding[];
}

export function SecurityFindingsList({ findings }: SecurityFindingsListProps) {
  if (findings.length === 0) {
    return <p className="text-sm text-muted-foreground">No security findings were reported.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {findings.map((finding, index) => (
        <li key={index} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                SEVERITY_BADGE_CLASSES[finding.severity] ?? 'bg-muted text-muted-foreground'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              {finding.severity}
            </span>
            <span className="text-xs text-muted-foreground">{finding.issueType.replace(/_/g, ' ')}</span>
            {finding.location && <span className="text-xs text-muted-foreground">&middot; {finding.location}</span>}
          </div>
          <p className="mt-2 text-sm font-medium">{finding.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{finding.description}</p>
          {finding.recommendation && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Recommendation: </span>
              {finding.recommendation}
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
