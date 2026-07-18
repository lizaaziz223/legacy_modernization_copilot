'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { projectService } from '@/services';
import { Project } from '@/types';
import { ProjectCard } from '@/components/projects';
import { Button, EmptyState, EmptyProjectsIllustration } from '@/components/ui';

type LoadState = 'loading' | 'loaded' | 'error';

export default function HistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    projectService
      .list()
      .then((data) => {
        setProjects(data);
        setState('loaded');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Project History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Projects you&apos;ve previously uploaded</p>
      </div>

      {state === 'loading' && <p className="text-sm text-muted-foreground">Loading projects...</p>}
      {state === 'error' && <p className="text-sm text-destructive">Failed to load project history</p>}

      {state === 'loaded' && projects.length === 0 && (
        <EmptyState
          illustration={<EmptyProjectsIllustration />}
          title="No projects yet"
          description="Upload your first legacy application to start building a project history you can revisit anytime."
          action={
            <Button asChild>
              <Link href="/upload">
                <Upload className="h-4 w-4" />
                Upload Project
              </Link>
            </Button>
          }
        />
      )}

      {state === 'loaded' && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
