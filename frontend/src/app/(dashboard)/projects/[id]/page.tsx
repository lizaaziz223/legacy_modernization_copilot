'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { ScanSearch, Loader2, Network, Map, Download, ClipboardList } from 'lucide-react';
import { ProjectSummaryCard } from '@/components/upload';
import { TechnologyDetectionPanel } from '@/components/detection';
import { ArchitectureAnalysisPanel } from '@/components/architecture';
import { ModernizationPlanPanel } from '@/components/planner';
import { ProjectScorecardChart } from '@/components/charts';
import { ProjectTimeline } from '@/components/projects';
import { Button, EmptyState, EmptyAnalysisIllustration, PanelSkeleton, ErrorState, Progress, Skeleton, DebugErrorBoundary } from '@/components/ui';
import {
  projectService,
  technologyDetectionService,
  architectureAnalysisService,
  modernizationPlanService,
  securityAnalysisStatusService,
  performanceAnalysisStatusService,
  modernizationReportService,
} from '@/services';
import { Project, TechnologyDetectionResult, ArchitectureAnalysisResult, ModernizationPlan } from '@/types';
import { triggerBlobDownload } from '@/utils';

type LoadState = 'loading' | 'loaded' | 'error';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [projectState, setProjectState] = useState<LoadState>('loading');

  const [detection, setDetection] = useState<TechnologyDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const [architecture, setArchitecture] = useState<ArchitectureAnalysisResult | null>(null);
  const [isAnalyzingArchitecture, setIsAnalyzingArchitecture] = useState(false);
  const [architectureError, setArchitectureError] = useState<string | null>(null);

  const [plan, setPlan] = useState<ModernizationPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [securityRiskScore, setSecurityRiskScore] = useState<number | undefined>(undefined);
  const [performanceScore, setPerformanceScore] = useState<number | undefined>(undefined);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const loadProject = useCallback(() => {
    setProjectState('loading');
    projectService
      .get(id)
      .then((data) => {
        setProject(data);
        setProjectState('loaded');
      })
      .catch(() => setProjectState('error'));
  }, [id]);

  useEffect(() => {
    loadProject();

    technologyDetectionService
      .get(id)
      .then(setDetection)
      .catch(() => setDetection(null));

    architectureAnalysisService
      .get(id)
      .then(setArchitecture)
      .catch(() => setArchitecture(null));

    modernizationPlanService
      .get(id)
      .then(setPlan)
      .catch(() => setPlan(null));

    securityAnalysisStatusService
      .get(id)
      .then((result) => setSecurityRiskScore(result.overallRiskScore))
      .catch(() => setSecurityRiskScore(undefined));

    performanceAnalysisStatusService
      .get(id)
      .then((result) => setPerformanceScore(result.performanceScore))
      .catch(() => setPerformanceScore(undefined));
  }, [id, loadProject]);

  const handleRunDetection = async () => {
    setIsDetecting(true);
    setDetectionError(null);
    try {
      const result = await technologyDetectionService.run(id);
      setDetection(result);
      toast.success('Technology detection complete');
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      const finalMessage = message ?? 'Failed to run technology detection';
      setDetectionError(finalMessage);
      toast.error(finalMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRunArchitectureAnalysis = async () => {
    setIsAnalyzingArchitecture(true);
    setArchitectureError(null);
    try {
      const result = await architectureAnalysisService.run(id);
      setArchitecture(result);
      toast.success('Architecture analysis complete');
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      const finalMessage = message ?? 'Failed to run architecture analysis';
      setArchitectureError(finalMessage);
      toast.error(finalMessage);
    } finally {
      setIsAnalyzingArchitecture(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    setPlanError(null);
    try {
      const result = await modernizationPlanService.run(id);
      setPlan(result);
      toast.success('Modernization roadmap generated');
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      const finalMessage = message ?? 'Failed to generate modernization plan';
      setPlanError(finalMessage);
      toast.error(finalMessage);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const blob = await modernizationReportService.downloadPdf(id);
      triggerBlobDownload(blob, `${project?.name ?? 'project'}-modernization-report.pdf`);
      toast.success('Report downloaded');
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      const finalMessage = message ?? 'Failed to download report';
      setDownloadError(finalMessage);
      toast.error(finalMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  if (projectState === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PanelSkeleton />
          <PanelSkeleton />
        </div>
        <PanelSkeleton />
      </div>
    );
  }

  if (projectState === 'error' || !project) {
    return <ErrorState message="Failed to load project" onRetry={loadProject} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Project details and analysis</p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-start">
          <Link
            href={`/projects/${id}/executive-summary`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline hover:opacity-90"
          >
            <ClipboardList className="h-4 w-4" />
            Executive Summary
          </Link>
          <div>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isDownloading ? 'Preparing PDF...' : 'Download PDF Report'}
            </button>
            {downloadError && <p className="mt-1 text-sm text-destructive">{downloadError}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DebugErrorBoundary label="ProjectSummaryCard">
          <ProjectSummaryCard project={project} technology={detection} isDetecting={isDetecting} />
        </DebugErrorBoundary>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold">Scorecard</h3>
          <div className="mt-2">
            <DebugErrorBoundary label="ProjectScorecardChart">
              <ProjectScorecardChart
                architectureScore={architecture?.architectureScore}
                securityRiskScore={securityRiskScore}
                performanceScore={performanceScore}
              />
            </DebugErrorBoundary>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold">Timeline</h3>
        <div className="mt-4">
          <DebugErrorBoundary label="ProjectTimeline">
            <ProjectTimeline project={project} />
          </DebugErrorBoundary>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Technology Detection</h2>
          {detection && (
            <button
              type="button"
              onClick={handleRunDetection}
              disabled={isDetecting}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {isDetecting ? 'Detecting...' : 'Re-run Technology Detection'}
            </button>
          )}
        </div>
        {detectionError && <p className="mt-2 text-sm text-destructive">{detectionError}</p>}

        <div className="mt-4">
          {detection ? (
            <DebugErrorBoundary label="TechnologyDetectionPanel">
              <TechnologyDetectionPanel result={detection} />
            </DebugErrorBoundary>
          ) : isDetecting ? (
            <div className="flex flex-col gap-3">
              <Progress indeterminate />
              <PanelSkeleton />
            </div>
          ) : (
            <EmptyState
              illustration={<EmptyAnalysisIllustration />}
              title="No technology detection yet"
              description="Identify legacy frameworks, build tools, application servers, and databases used in this codebase."
              action={
                <Button onClick={handleRunDetection} disabled={isDetecting}>
                  {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                  {isDetecting ? 'Detecting...' : 'Run Analysis'}
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Architecture Analysis</h2>
          {architecture && (
            <button
              type="button"
              onClick={handleRunArchitectureAnalysis}
              disabled={isAnalyzingArchitecture}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isAnalyzingArchitecture ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
              {isAnalyzingArchitecture ? 'Analyzing...' : 'Re-run Architecture Analysis'}
            </button>
          )}
        </div>
        {architectureError && <p className="mt-2 text-sm text-destructive">{architectureError}</p>}

        <div className="mt-4">
          {architecture ? (
            <DebugErrorBoundary label="ArchitectureAnalysisPanel">
              <ArchitectureAnalysisPanel result={architecture} />
            </DebugErrorBoundary>
          ) : isAnalyzingArchitecture ? (
            <div className="flex flex-col gap-3">
              <Progress indeterminate />
              <PanelSkeleton />
            </div>
          ) : (
            <EmptyState
              illustration={<EmptyAnalysisIllustration />}
              title="No architecture analysis yet"
              description="See this project's current architecture pattern and an AI-generated target architecture with a migration path."
              action={
                <Button onClick={handleRunArchitectureAnalysis} disabled={isAnalyzingArchitecture}>
                  {isAnalyzingArchitecture ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
                  {isAnalyzingArchitecture ? 'Analyzing...' : 'Run Analysis'}
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Modernization Roadmap</h2>
          {plan && (
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isPlanning}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isPlanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
              {isPlanning ? 'Generating...' : 'Regenerate Roadmap'}
            </button>
          )}
        </div>
        {planError && <p className="mt-2 text-sm text-destructive">{planError}</p>}

        <div className="mt-4">
          {plan ? (
            <DebugErrorBoundary label="ModernizationPlanPanel">
              <ModernizationPlanPanel plan={plan} />
            </DebugErrorBoundary>
          ) : isPlanning ? (
            <div className="flex flex-col gap-3">
              <Progress indeterminate />
              <PanelSkeleton />
            </div>
          ) : (
            <EmptyState
              illustration={<EmptyAnalysisIllustration />}
              title="No modernization roadmap yet"
              description="Generate a prioritized migration strategy, complexity scoring, quick wins, and a risk-ranked roadmap. Works best after running the analyses above, but isn't required."
              action={
                <Button onClick={handleGeneratePlan} disabled={isPlanning}>
                  {isPlanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
                  {isPlanning ? 'Generating...' : 'Generate Roadmap'}
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
