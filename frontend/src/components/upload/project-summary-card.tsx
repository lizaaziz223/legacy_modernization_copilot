import { CheckCircle2, Files, FolderTree, HardDrive, Cpu, Coffee, Clock, Loader2 } from 'lucide-react';
import { Project, TechnologyDetectionResult } from '@/types';
import { formatBytes, formatDateTime, formatDuration } from '@/utils';
import { estimateAnalysisSeconds } from '@/lib/analysis-estimate';
import { ProjectThumbnail } from './project-thumbnail';

interface ProjectSummaryCardProps {
  project: Project;
  /** Optional: populated once technology detection has run (e.g. auto-triggered right after upload). */
  technology?: TechnologyDetectionResult | null;
  isDetecting?: boolean;
}

export function ProjectSummaryCard({ project, technology, isDetecting }: ProjectSummaryCardProps) {
  const extensions = Object.entries(project.fileExtensionBreakdown).sort(([, a], [, b]) => b - a);
  const estimatedSeconds = estimateAnalysisSeconds(project.totalFiles, project.totalSizeBytes);

  return (
    <div className="animate-fade-in-up rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <ProjectThumbnail name={project.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <h3 className="truncate font-semibold">{project.name}</h3>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Uploaded {formatDateTime(project.createdAt)} from {project.originalFileName}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <Files className="h-3.5 w-3.5" /> Files
          </p>
          <p className="text-lg font-semibold">{project.totalFiles}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <FolderTree className="h-3.5 w-3.5" /> Folders
          </p>
          <p className="text-lg font-semibold">{project.totalFolders}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" /> Project size
          </p>
          <p className="text-lg font-semibold">{formatBytes(project.totalSizeBytes)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" /> Technologies detected
          </p>
          {isDetecting ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting...
            </p>
          ) : (
            <p className="text-lg font-semibold">{technology ? technology.detectedTechnologies.length : '—'}</p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <Coffee className="h-3.5 w-3.5" /> Java version
          </p>
          {isDetecting ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting...
            </p>
          ) : (
            <p className="text-lg font-semibold">{technology?.javaVersion.value ?? '—'}</p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Est. analysis time
          </p>
          <p className="text-lg font-semibold">~{formatDuration(estimatedSeconds)}</p>
        </div>
      </div>

      {extensions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Files by extension</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {extensions.map(([extension, count]) => (
              <span
                key={extension}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                .{extension} &middot; {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
