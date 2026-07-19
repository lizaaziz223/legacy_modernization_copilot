'use client';

import { Upload } from 'lucide-react';
import { useProjectAnalysisStages, type AnalysisStage } from '@/hooks';
import { Project } from '@/types';
import { Skeleton } from '@/components/ui';
import { formatDateTime } from '@/utils';

interface ProjectTimelineProps {
  project: Project;
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  const stages = useProjectAnalysisStages(project.id);

  if (!stages) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const completedStages = stages
    .filter((stage) => stage.completedAt)
    .sort((a, b) => new Date(a.completedAt as string).getTime() - new Date(b.completedAt as string).getTime());
  const pendingStages = stages.filter((stage) => !stage.completedAt);

  const timelineEntries: AnalysisStage[] = [
    { key: 'upload', label: 'Project Uploaded', icon: Upload, completedAt: project.createdAt },
    ...completedStages,
  ];

  return (
    <div className="flex flex-col gap-6">
      <ol className="relative border-l border-border pl-6">
        {timelineEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <li key={entry.key} className="mb-6 last:mb-0">
              <span className="absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-medium">{entry.label}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(entry.completedAt as string)}</p>
            </li>
          );
        })}
      </ol>

      {pendingStages.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Not yet run</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {pendingStages.map((stage) => (
              <li
                key={stage.key}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                <stage.icon className="h-3.5 w-3.5" />
                {stage.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
