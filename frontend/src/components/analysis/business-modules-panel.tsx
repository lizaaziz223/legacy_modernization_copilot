import { Workflow, Database } from 'lucide-react';
import type { BusinessAnalysisResult } from '@/types';

interface BusinessModulesPanelProps {
  business: BusinessAnalysisResult;
}

export function BusinessModulesPanel({ business }: BusinessModulesPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {business.businessPurpose && <p className="text-sm text-muted-foreground">{business.businessPurpose}</p>}

      {business.moduleSummary.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold">Modules</h4>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {business.moduleSummary.map((module) => (
              <div key={module.moduleName} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{module.moduleName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        business.mainModules.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold">Modules</h4>
            <ul className="mt-2 flex flex-wrap gap-2">
              {business.mainModules.map((module) => (
                <li key={module} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {module}
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {business.criticalWorkflows.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <Workflow className="h-4 w-4" /> Critical Workflows
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {business.criticalWorkflows.map((workflow) => (
              <li key={workflow}>{workflow}</li>
            ))}
          </ul>
        </div>
      )}

      {business.coreEntities.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <Database className="h-4 w-4" /> Core Entities
          </h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {business.coreEntities.map((entity) => (
              <li key={entity} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {entity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
