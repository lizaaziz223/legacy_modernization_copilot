import { Layers } from 'lucide-react';

interface ReportBrandHeaderProps {
  projectName: string;
  generatedAt: Date;
}

/**
 * The report's brand lockup - logomark + product name - shown at the top of
 * the on-screen report. The PDF cover page draws an equivalent logomark with
 * react-pdf's Svg primitives (see src/lib/report-pdf.tsx) since there's no
 * shared image asset to embed in both places.
 */
export function ReportBrandHeader({ projectName, generatedAt }: ReportBrandHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">AI Legacy Modernization Copilot</p>
          <p className="text-xs text-muted-foreground">Modernization Report</p>
        </div>
      </div>
      <div className="sm:text-right">
        <p className="text-lg font-semibold leading-tight">{projectName}</p>
        <p className="text-xs text-muted-foreground">Generated {generatedAt.toLocaleString()}</p>
      </div>
    </div>
  );
}
