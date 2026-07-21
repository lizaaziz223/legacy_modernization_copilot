import { Clock } from 'lucide-react';
import { StatCard } from '@/components/dashboard';
import { LevelBadge } from '@/components/planner';
import type { ModernizationPlan } from '@/types';

interface MigrationRoadmapPanelProps {
  plan: ModernizationPlan;
}

export function MigrationRoadmapPanel({ plan }: MigrationRoadmapPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{plan.migrationStrategy}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Estimated Timeline" value={plan.estimatedTimeline} icon={Clock} />
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Migration Complexity</p>
          <LevelBadge level={plan.migrationComplexity} />
        </div>
      </div>

      {plan.priorityMatrix.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Priority Matrix</h4>
          <div className="mt-2 overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Impact</th>
                  <th className="px-4 py-2 font-medium">Effort</th>
                </tr>
              </thead>
              <tbody>
                {plan.priorityMatrix.map((row) => (
                  <tr key={row.item} className="border-t border-border">
                    <td className="px-4 py-2">{row.item}</td>
                    <td className="px-4 py-2">
                      <LevelBadge level={row.impact} />
                    </td>
                    <td className="px-4 py-2">
                      <LevelBadge level={row.effort} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {plan.risks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Risks</h4>
          <ul className="mt-2 flex flex-col gap-2">
            {plan.risks.map((risk) => (
              <li
                key={risk.description}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm"
              >
                <span>{risk.description}</span>
                <LevelBadge level={risk.severity} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
