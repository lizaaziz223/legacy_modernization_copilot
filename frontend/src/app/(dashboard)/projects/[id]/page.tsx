'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { ScanSearch, Loader2, Network, Map, Download, ClipboardList } from 'lucide-react';
import { ProjectSummaryCard } from '@/components/upload';
import { TechnologyDetectionPanel } from '@/components/detection';
import { ArchitectureAnalysisPanel } from '@/components/architecture';
import { ModernizationPlanPanel } from '@/components/planner';
import { ProjectScorecardChart } from '@/components/charts';
import { ProjectTimeline } from '@/components/projects';
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

  useEffect(() => {
    projectService
      .get(id)
      .then((data) => {
        setProject(data);
        setProjectState('loaded');
      })
      .catch(() => setProjectState('error'));

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
  }, [id]);

  const handleRunDetection = async () => {
    setIsDetecting(true);
    setDetectionError(null);
    try {
      const result = await technologyDetectionService.run(id);
      setDetection(result);
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      setDetectionError(message ?? 'Failed to run technology detection');
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
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      setArchitectureError(message ?? 'Failed to run architecture analysis');
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
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      setPlanError(message ?? 'Failed to generate modernization plan');
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
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      setDownloadError(message ?? 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  if (projectState === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading project...</p>;
  }

  if (projectState === 'error' || !project) {
    return <p className="text-sm text-destructive">Failed to load project</p>;
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
        <ProjectSummaryCard project={project} />
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold">Scorecard</h3>
          <div className="mt-2">
            <ProjectScorecardChart
              architectureScore={architecture?.architectureScore}
              securityRiskScore={securityRiskScore}
              performanceScore={performanceScore}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold">Timeline</h3>
        <div className="mt-4">
          <ProjectTimeline project={project} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Technology Detection</h2>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunDetection}
            disabled={isDetecting}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
            {isDetecting ? 'Detecting...' : detection ? 'Re-run Technology Detection' : 'Run Technology Detection'}
          </button>
          {detectionError && <p className="text-sm text-destructive">{detectionError}</p>}
        </div>

        <div className="mt-4">
          {detection ? (
            <TechnologyDetectionPanel result={detection} />
          ) : (
            <p className="text-sm text-muted-foreground">
              This project hasn&apos;t been analyzed yet. Run technology detection to see results.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Architecture Analysis</h2>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunArchitectureAnalysis}
            disabled={isAnalyzingArchitecture}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isAnalyzingArchitecture ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
            {isAnalyzingArchitecture
              ? 'Analyzing...'
              : architecture
                ? 'Re-run Architecture Analysis'
                : 'Run Architecture Analysis'}
          </button>
          {architectureError && <p className="text-sm text-destructive">{architectureError}</p>}
        </div>

        <div className="mt-4">
          {architecture ? (
            <ArchitectureAnalysisPanel result={architecture} />
          ) : (
            <p className="text-sm text-muted-foreground">
              This project hasn&apos;t had an architecture analysis yet. Run it to see the current and target
              architecture diagrams.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Modernization Roadmap</h2>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={isPlanning}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isPlanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
            {isPlanning ? 'Generating...' : plan ? 'Regenerate Roadmap' : 'Generate Modernization Roadmap'}
          </button>
          {planError && <p className="text-sm text-destructive">{planError}</p>}
        </div>

        <div className="mt-4">
          {plan ? (
            <ModernizationPlanPanel plan={plan} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No modernization roadmap yet. Generating one works best after running the other analyses above,
              but isn&apos;t required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
