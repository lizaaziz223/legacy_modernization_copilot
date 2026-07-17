'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Network,
  ShieldAlert,
  Gauge,
  Cpu,
  AlertOctagon,
  Map,
  Coffee,
  Cloud,
  DollarSign,
  Clock,
  Grid3x3,
  FolderOpen,
  Download,
  Loader2,
} from 'lucide-react';
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
  MigrationRoadmapPanel,
  CloudRecommendationPanel,
  ModernizationScoreCard,
} from '@/components/analysis';
import { RiskList, RecommendationList } from '@/components/executive-summary';
import { ReportBrandHeader, RiskMatrixGrid, CostEstimateCard, SpringBootRecommendationPanel } from '@/components/reports';
import { Progress } from '@/components/ui';
import {
  computeMaintainability,
  computeTechnicalDebt,
  computeCloudReadiness,
  computeOverallScore,
  topRisks,
  topRecommendations,
} from '@/lib/executive-summary';
import { computeCostEstimate, buildRiskMatrix } from '@/lib/report';
import { cn, triggerBlobDownload } from '@/utils';

type LoadState = 'loading' | 'loaded' | 'error';

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsState, setProjectsState] = useState<LoadState>('loading');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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
  const { project, business, technology, architecture, security, performance, plan } = analysis;

  const findingsCount = (security?.findings.length ?? 0) + (performance?.findings.length ?? 0);
  const technicalDebt = computeTechnicalDebt(security?.findings ?? [], plan?.migrationComplexity);
  const cloudReadiness = computeCloudReadiness(plan);
  const overallScore = computeOverallScore([
    architecture?.architectureScore ?? null,
    security ? 100 - security.overallRiskScore : null,
    performance?.performanceScore ?? null,
    cloudReadiness,
    computeMaintainability(architecture?.architectureScore ?? null, findingsCount),
  ]);
  const costEstimate = project ? computeCostEstimate(project, plan, findingsCount) : null;
  const riskMatrix = buildRiskMatrix(security, plan);
  const risks = topRisks(security, plan);
  const recommendations = topRecommendations(architecture, plan, security);

  const handleDownloadPdf = async () => {
    if (!project) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      // Loaded on demand - @react-pdf/renderer is large and most report views never download a PDF.
      const { generateReportPdfBlob } = await import('@/lib/report-pdf');
      const blob = await generateReportPdfBlob({
        project,
        business,
        technology,
        architecture,
        security,
        performance,
        plan,
        overallScore,
        technicalDebt,
        cloudReadiness,
        costEstimate,
        riskMatrix,
        topRisksList: risks,
        topRecommendationsList: recommendations,
        generatedAt: new Date(),
      });
      triggerBlobDownload(blob, `${project.name}-modernization-report.pdf`);
    } catch {
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete modernization report for a single project, ready to review on screen or export as a branded
          PDF.
        </p>
      </div>

      {projectsState === 'loading' && <p className="text-sm text-muted-foreground">Loading projects...</p>}
      {projectsState === 'error' && <p className="text-sm text-destructive">Failed to load projects</p>}

      {projectsState === 'loaded' && projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No projects uploaded yet. <Link href="/upload">Upload your first project</Link> to generate a report.
          </p>
        </div>
      )}

      {projectsState === 'loaded' && projects.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  p.id === selectedProjectId
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <ProjectThumbnail name={p.name} size={24} />
                <span className="max-w-[10rem] truncate">{p.name}</span>
              </button>
            ))}
          </div>

          {analysis.state === 'loading' && <p className="text-sm text-muted-foreground">Loading report...</p>}
          {analysis.state === 'error' && (
            <p className="text-sm text-destructive">Failed to load this project&apos;s report</p>
          )}

          {analysis.state === 'loaded' && project && (
            <div className="flex flex-col gap-4">
              <ReportBrandHeader projectName={project.name} generatedAt={new Date()} />

              <div className="flex items-center justify-end gap-3">
                {pdfError && <p className="text-sm text-destructive">{pdfError}</p>}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download Professional PDF'}
                </button>
              </div>

              <CollapsibleSection title="1. Executive Summary" icon={Sparkles} animationDelayMs={0}>
                <div className="flex flex-col gap-6">
                  <ModernizationScoreCard score={overallScore} />
                  {business?.businessPurpose ? (
                    <p className="text-sm text-muted-foreground">{business.businessPurpose}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Run business analysis to see a business purpose summary.</p>
                  )}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Top Risks</h4>
                      <RiskList risks={risks} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Top Recommendations</h4>
                      <RecommendationList recommendations={recommendations} />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="2. Architecture" icon={Network} animationDelayMs={40}>
                {architecture ? (
                  <ArchitectureAnalysisPanel result={architecture} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run architecture analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="3. Security" icon={ShieldAlert} animationDelayMs={80}>
                {security ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Risk Score</span>
                      <span className="text-muted-foreground">{security.overallRiskScore}/100</span>
                    </div>
                    <SecurityFindingsList findings={security.findings} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Run security analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="4. Performance" icon={Gauge} animationDelayMs={120}>
                {performance ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Performance Score</span>
                      <span className="text-muted-foreground">{performance.performanceScore}/100</span>
                    </div>
                    <PerformanceFindingsList findings={performance.findings} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Run performance analysis to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="5. Technology" icon={Cpu} animationDelayMs={160}>
                {technology ? (
                  <TechnologyDetectionPanel result={technology} />
                ) : (
                  <p className="text-sm text-muted-foreground">Run technology detection to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="6. Technical Debt" icon={AlertOctagon} animationDelayMs={200}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Debt Level</span>
                    <span className="text-muted-foreground">{technicalDebt}/100</span>
                  </div>
                  <Progress value={technicalDebt} />
                  <p className="text-xs text-muted-foreground">
                    Derived from security finding severity and migration complexity - higher means more accumulated
                    debt to address during modernization.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="7. Migration Roadmap" icon={Map} animationDelayMs={240}>
                {plan ? (
                  <MigrationRoadmapPanel plan={plan} />
                ) : (
                  <p className="text-sm text-muted-foreground">Generate a modernization roadmap to see results.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="8. Spring Boot Recommendation" icon={Coffee} animationDelayMs={280}>
                <SpringBootRecommendationPanel plan={plan} technology={technology} />
              </CollapsibleSection>

              <CollapsibleSection title="9. Cloud Recommendation" icon={Cloud} animationDelayMs={320}>
                <CloudRecommendationPanel plan={plan} />
              </CollapsibleSection>

              <CollapsibleSection title="10. Estimated Cost" icon={DollarSign} animationDelayMs={360}>
                <CostEstimateCard estimate={costEstimate} />
              </CollapsibleSection>

              <CollapsibleSection title="11. Estimated Timeline" icon={Clock} animationDelayMs={400}>
                {plan ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Estimated Timeline</p>
                      <p className="text-lg font-semibold">{plan.estimatedTimeline}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Quick Wins (near-term)</p>
                      <p className="text-lg font-semibold">{plan.quickWins.length} items</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Remaining Roadmap Items</p>
                      <p className="text-lg font-semibold">{plan.priorityMatrix.length} items</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Generate a modernization roadmap to see a timeline.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="12. Risk Matrix" icon={Grid3x3} animationDelayMs={440}>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Migration risks are plotted on the diagonal since the roadmap only records a single severity, not
                    a separate likelihood.
                  </p>
                  <RiskMatrixGrid matrix={riskMatrix} />
                </div>
              </CollapsibleSection>
            </div>
          )}
        </>
      )}
    </div>
  );
}
