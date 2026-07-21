import type { LucideIcon } from 'lucide-react';
import { DetectedAttribute } from '@/types';

interface DetectedAttributeTileProps {
  label: string;
  icon: LucideIcon;
  attribute: DetectedAttribute;
}

/**
 * A single detected build/runtime/framework attribute: its value, a
 * confidence bar, and a collapsible "how was this detected" evidence list -
 * so every version shown can always be explained, not just displayed.
 */
export function DetectedAttributeTile({ label, icon: Icon, attribute }: DetectedAttributeTileProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-base font-semibold" title={attribute.value}>
            {attribute.value}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${attribute.confidenceScore}%` }} />
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{attribute.confidenceScore}%</span>
      </div>

      {attribute.evidence.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
            How was this detected?
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            {attribute.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
