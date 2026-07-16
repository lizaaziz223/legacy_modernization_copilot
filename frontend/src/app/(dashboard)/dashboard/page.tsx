'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, Files, HardDrive, Clock } from 'lucide-react';
import { StatCard, SystemStatusCard } from '@/components/dashboard';
import { ProjectFilesChart } from '@/components/charts';
import { ProjectCard } from '@/components/projects';
import { projectService } from '@/services';
import { Project } from '@/types';
import { formatBytes, formatDateTime } from '@/utils';
import { useProjectListActions } from '@/hooks';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleRenamed, handleDeleteRequested } = useProjectListActions(projects, setProjects);

  useEffect(() => {
    projectService
      .list()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setIsLoading(false));
  }, []);

  const totalFiles = projects.reduce((sum, project) => sum + project.totalFiles, 0);
  const totalSizeBytes = projects.reduce((sum, project) => sum + project.totalSizeBytes, 0);
  const lastUpload = projects[0]?.createdAt;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your legacy modernization projects
        </p>
      </div>

      <SystemStatusCard />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Total Files" value={totalFiles} icon={Files} />
        <StatCard label="Total Size" value={formatBytes(totalSizeBytes)} icon={HardDrive} />
        <StatCard label="Last Upload" value={lastUpload ? formatDateTime(lastUpload) : '—'} icon={Clock} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Files by Project</h2>
        <div className="mt-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <ProjectFilesChart projects={projects} />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Projects</h2>
          <Link href="/history" className="text-sm">
            View all
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!isLoading && projects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No projects uploaded yet. <Link href="/upload">Upload your first project</Link>.
            </p>
          )}
          {projects.slice(0, 6).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRenamed={handleRenamed}
              onDeleteRequested={handleDeleteRequested}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
