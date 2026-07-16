'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, GitBranch, Layers, Network, ShieldAlert, Gauge, Map, Lightbulb, Cloud, Sparkles, FolderOpen } from 'lucide-react';
import { projectService } from '@/services';
import { Project } from '@/types';
import { useProjectFullAnalysis } from '@/hooks';
import { ProjectThumbnail } from '@/components/upload';
import { TechnologyDetectionPanel } from '@/components/detection';
import { ArchitectureAnalysisPanel } from '@/components/architecture';
import {
  CollapsibleSection,
  SecurityFindingsList,
  PerformanceFindingsList,
  BusinessModulesPanel,
  DependencyGraphSection,
  MigrationRoadmapPanel,
  ModernizationSuggestionsList,
  CloudRecommendationPanel,
  ModernizationScoreCard,
} from '@/components/analysis';
import { computeMaintainability, computeCloudReadiness, computeOverallScore } from '@/lib/executive-summary';
import { cn } from '@/utils';

type LoadState = 'loading' | 'loaded' | 'error';

export default function AnalysisPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsState, setProjectsState] = useState<LoadState>('loading');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    projectService
      .list()
      .then((data) => {
        setProjects(data);
        setProjectsState('loaded');
        if (data.length > 0) setSelectedProjectId(data[0].id);
      })
      .catch(() => setProjectsState('error'));
  }, []);

  const analysis = useProjectFullAnalysis(selectedProjectId ?? '');

  const findingsCount = (analysis.security?.findings.length ?? 0) + (analysis.performance?.findings.length ?? 0);
  const overallScore = computeOverallScore([
    analysis.architecture?.architectureScore ?? null,
    analysis.security ? 100 - analysis.security.overallRiskScore : null,
    analysis.performance?.performanceScore ?? null,
    computeCloudReadiness(analysis.plan),
    computeMaintainability(analysis.architecture?.architectureScore ?? null, findingsCount),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full AI-generated analysis for a single project - technology stack, architecture, security, performance,
          and modernization roadmap.
        </p>
      </div>

      {projectsState === 'loading' && <p className="text-sm text-muted-foreground">Loading projects...</p>}
      {projectsState === 'error' && <p className="text-sm text-destructive">Failed to load projects</p>}

      {projectsState === 'loaded' && projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No projects uploaded yet. <Link href="/upload">Upload your first project</Link> to see its analysis
            here.
          </p>
        </div>
      )}

      {projectsState === 'loaded' && projects.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  project.id === selectedProjectId
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <ProjectThumbnail name={project.name} size={24} />
                <span className="max-w-[10rem] truncate">{project.name}</span>
              </button>
            ))}
          </div>

          {analysis.state === 'loading' && <p className="text-sm text-muted-foreground">Loading analysis...</p>}
          {analysis.state === 'error' && (
            <p className="text-sm text-destructive">Failed to load this project&apos;s analysis</p>
          )}

          {analysis.state === 'loaded' && (
            <div className="flex flex-col gap-4">
              <CollapsibleSection title="Modernization Score" icon={Sparkles} animationDelayMs={0}>
                <ModernizationScoreCard score={overallScore} />
              </CollapsibleSection>

              <CollapsibleSection title="Technology Stack" icon={Cpu} animationDelayMs={40}>
                {analysis.technology ? (
                  <TechnologyDetectionPanel result={analysis.technology} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run technology detection to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Dependency Graph" icon={GitBranch} animationDelayMs={80} defaultOpen={false}>
                <DependencyGraphSection
                  projectName={analysis.project?.name ?? ''}
                  modules={analysis.business?.mainModules ?? []}
                  entities={analysis.business?.coreEntities ?? []}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Business Modules" icon={Layers} animationDelayMs={120}>
                {analysis.business ? (
                  <BusinessModulesPanel business={analysis.business} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run business analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Architecture Diagram" icon={Network} animationDelayMs={160}>
                {analysis.architecture ? (
                  <ArchitectureAnalysisPanel result={analysis.architecture} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run architecture analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Security Findings" icon={ShieldAlert} animationDelayMs={200}>
                {analysis.security ? (
                  <SecurityFindingsList findings={analysis.security.findings} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run security analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Performance Findings" icon={Gauge} animationDelayMs={240}>
                {analysis.performance ? (
                  <PerformanceFindingsList findings={analysis.performance.findings} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run performance analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Migration Roadmap" icon={Map} animationDelayMs={280}>
                {analysis.plan ? (
                  <MigrationRoadmapPanel plan={analysis.plan} />
                ) : (
                  <p className="text-sm text-muted-foreground">Generate a modernization roadmap to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Modernization Suggestions" icon={Lightbulb} animationDelayMs={320}>
                {analysis.plan ? (
                  <ModernizationSuggestionsList suggestions={analysis.plan.quickWins} />
                ) : (
                  <p className="text-sm text-muted-foreground">Generate a modernization roadmap to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Cloud Recommendation" icon={Cloud} animationDelayMs={360}>
                <CloudRecommendationPanel plan={analysis.plan} />
              </CollapsibleSection>
            </div>
          )}
        </>
      )}
    </div>
  );
}
