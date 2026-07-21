import Link from 'next/link';
import { FolderKanban, Files, HardDrive } from 'lucide-react';
import { Project } from '@/types';
import { formatBytes, formatDateTime } from '@/utils';

interface ProjectCardProps {
  project: Project;
  animationDelayMs?: number;
}

export function ProjectCard({ project, animationDelayMs = 0 }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group animate-fade-in-up flex flex-col gap-3 rounded-lg border border-border bg-card p-4 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <FolderKanban className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground group-hover:underline">{project.name}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(project.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Files className="h-3.5 w-3.5" />
          {project.totalFiles} files
        </span>
        <span className="flex items-center gap-1">
          <HardDrive className="h-3.5 w-3.5" />
          {formatBytes(project.totalSizeBytes)}
        </span>
      </div>
    </Link>
  );
}
