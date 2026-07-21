import { Fragment } from 'react';
import type { Level } from '@/types';
import type { RiskMatrix } from '@/lib/report';
import { cn } from '@/utils';

const LIKELIHOOD_ROWS: Level[] = ['HIGH', 'MEDIUM', 'LOW'];
const IMPACT_COLUMNS: Level[] = ['LOW', 'MEDIUM', 'HIGH'];
const LEVEL_RANK: Record<Level, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const LEVEL_LABEL: Record<Level, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

function cellClass(likelihood: Level, impact: Level): string {
  const rank = LEVEL_RANK[likelihood] + LEVEL_RANK[impact];
  if (rank <= 2) return 'bg-status-good/10 border-status-good/30';
  if (rank <= 4) return 'bg-status-warning/10 border-status-warning/30';
  if (rank === 5) return 'bg-status-serious/10 border-status-serious/30';
  return 'bg-status-critical/10 border-status-critical/30';
}

interface RiskMatrixGridProps {
  matrix: RiskMatrix;
}

/**
 * A Likelihood x Impact risk matrix (rows = likelihood, high to low top to
 * bottom; columns = impact, low to high left to right). See
 * src/lib/report.ts `buildRiskMatrix` for how items are bucketed.
 */
export function RiskMatrixGrid({ matrix }: RiskMatrixGridProps) {
  const hasAnyItems = LIKELIHOOD_ROWS.some((likelihood) =>
    IMPACT_COLUMNS.some((impact) => matrix[likelihood][impact].length > 0)
  );

  if (!hasAnyItems) {
    return <p className="text-sm text-muted-foreground">No risks to plot yet - run security analysis or generate a modernization roadmap.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-xs font-medium text-muted-foreground">Impact &rarr;</p>
      <div className="grid grid-cols-[5rem_repeat(3,1fr)] gap-2">
        <div />
        {IMPACT_COLUMNS.map((impact) => (
          <div key={impact} className="text-center text-xs font-medium text-muted-foreground">
            {LEVEL_LABEL[impact]}
          </div>
        ))}

        {LIKELIHOOD_ROWS.map((likelihood) => (
          <Fragment key={likelihood}>
            <div className="flex items-center justify-end pr-1 text-right text-xs font-medium text-muted-foreground">
              {LEVEL_LABEL[likelihood]}
            </div>
            {IMPACT_COLUMNS.map((impact) => {
              const items = matrix[likelihood][impact];
              return (
                <div
                  key={impact}
                  className={cn('min-h-[5rem] rounded-md border p-2', cellClass(likelihood, impact))}
                >
                  {items.length === 0 ? (
                    <span className="text-xs text-muted-foreground">&mdash;</span>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {items.map((item) => (
                        <li key={item.title} className="line-clamp-2 text-xs font-medium" title={item.title}>
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
