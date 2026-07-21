import { UploadCloud } from 'lucide-react';
import { formatDuration } from '@/utils';

interface UploadProgressBarProps {
  progress: number;
  fileName: string;
  etaSeconds: number | null;
}

export function UploadProgressBar({ progress, fileName, etaSeconds }: UploadProgressBarProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <UploadCloud className="h-5 w-5 shrink-0 animate-upload-bounce text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium">{fileName}</span>
            <span className="shrink-0 text-muted-foreground">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {etaSeconds !== null && progress < 100
              ? `About ${formatDuration(etaSeconds)} remaining`
              : progress >= 100
                ? 'Finishing up...'
                : 'Estimating time remaining...'}
          </p>
        </div>
      </div>
    </div>
  );
}
