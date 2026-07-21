'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { Network, Upload } from 'lucide-react';
import { ArchitectureAnalysisPanel } from '@/components/architecture';
import { architectureAnalysisService, projectService } from '@/services';
import { ArchitectureAnalysisResult, Project } from '@/types';
import { Button, EmptyState, EmptyProjectsIllustration, EmptyAnalysisIllustration, CardGridSkeleton, PanelSkeleton, ErrorState } from '@/components/ui';

type ProjectsLoadState = 'loading' | 'loaded' | 'error';

export default function ArchitectureViewerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsState, setProjectsState] = useState<ProjectsLoadState>('loading');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [architecture, setArchitecture] = useState<ArchitectureAnalysisResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'missing' | 'error'>('idle');

  const loadProjects = () => {
    setProjectsState('loading');
    projectService
      .list()
      .then((data) => {
        setProjects(data);
        setProjectsState('loaded');
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(() => setProjectsState('error'));
  };

  useEffect(loadProjects, []);

  const loadArchitecture = () => {
    if (!selectedProjectId) {
      return;
    }
    setStatus('loading');
    setArchitecture(null);
    architectureAnalysisService
      .get(selectedProjectId)
      .then((result) => {
        setArchitecture(result);
        setStatus('loaded');
      })
      .catch((error: unknown) => {
        const isNotYetAnalyzed = isAxiosError(error) && error.response?.status === 404;
        setStatus(isNotYetAnalyzed ? 'missing' : 'error');
      });
  };

  useEffect(loadArchitecture, [selectedProjectId]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Architecture Viewer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review a project&apos;s current and target architecture diagrams
        </p>
      </div>

      {projectsState === 'loading' && <CardGridSkeleton count={3} />}
      {projectsState === 'error' && <ErrorState message="Failed to load projects" onRetry={loadProjects} />}

      {projectsState === 'loaded' && projects.length === 0 && (
        <EmptyState
          illustration={<EmptyProjectsIllustration />}
          title="No projects yet"
          description="Upload a legacy application to see its current and target architecture diagrams here."
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

      {projectsState === 'loaded' && projects.length > 0 && (
        <>
          <div className="max-w-sm">
            <label htmlFor="project-picker" className="text-sm font-medium">
              Project
            </label>
            <select
              id="project-picker"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {status === 'loading' && <PanelSkeleton />}
          {status === 'error' && (
            <ErrorState message="Failed to load this project's architecture analysis" onRetry={loadArchitecture} />
          )}
          {status === 'missing' && (
            <EmptyState
              illustration={<EmptyAnalysisIllustration />}
              title="No architecture analysis yet"
              description="Run an architecture analysis on this project to see its current and target diagrams."
              action={
                <Button asChild>
                  <Link href={`/projects/${selectedProjectId}`}>
                    <Network className="h-4 w-4" />
                    Run Analysis
                  </Link>
                </Button>
              }
            />
          )}
          {status === 'loaded' && architecture && <ArchitectureAnalysisPanel result={architecture} />}
        </>
      )}
    </div>
  );
}
