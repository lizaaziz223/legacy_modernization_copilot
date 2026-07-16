'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Building2,
  Cpu,
  Network,
  FileText,
  ShieldCheck,
  Gauge,
  Wrench,
  AlertOctagon,
  Rocket,
  Cloud,
  Sparkles,
  Clock,
} from 'lucide-react';
import { scoreAccent } from '@/components/dashboard';
import { ScoreCard, InfoCard, RiskList, RecommendationList } from '@/components/executive-summary';
import { Card, CardHeader, CardTitle, CardContent, Progress } from '@/components/ui';
import { useProjectFullAnalysis } from '@/hooks';
import {
  computeMaintainability,
  computeTechnicalDebt,
  computeCloudReadiness,
  computeOverallScore,
  computeAiConfidence,
  topRisks,
  topRecommendations,
} from '@/lib/executive-summary';

export default function ExecutiveSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const { state, project, business, technology, architecture, security, performance, plan } =
    useProjectFullAnalysis(id);

  if (state === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading executive summary...</p>;
  }

  if (state === 'error' || !project) {
    return <p className="text-sm text-destructive">Failed to load this project&apos;s executive summary.</p>;
  }

  const securityScore = security ? 100 - security.overallRiskScore : null;
  const findingsCount = (security?.findings.length ?? 0) + (performance?.findings.length ?? 0);
  const maintainability = computeMaintainability(architecture?.architectureScore ?? null, findingsCount);
  const technicalDebt = computeTechnicalDebt(security?.findings ?? [], plan?.migrationComplexity);
  const technicalDebtHealthScore = 100 - technicalDebt; // so scoreAccent's "higher is better" framing still applies
  const cloudReadiness = computeCloudReadiness(plan);
  const aiConfidence = computeAiConfidence(technology);
  const overallScore = computeOverallScore([
    architecture?.architectureScore ?? null,
    securityScore,
    performance?.performanceScore ?? null,
    cloudReadiness,
    maintainability,
  ]);

  const risks = topRisks(security, plan);
  const recommendations = topRecommendations(architecture, plan, security);

  const topTechnologies = technology?.detectedTechnologies.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <Link href={`/projects/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to project
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Executive Summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.name}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{project.name} - Executive Summary</h1>
        <p className="text-sm text-muted-foreground">Generated {new Date().toLocaleString()}</p>
      </div>

      <Card className="animate-fade-in-up">
        <CardContentOverallScore score={overallScore} />
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Project Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="Business Domain" icon={Building2} accent="chart-1" animationDelayMs={0}>
            {business?.businessPurpose ? (
              <p className="line-clamp-4">{business.businessPurpose}</p>
            ) : (
              <p className="text-muted-foreground">Not yet analyzed</p>
            )}
          </InfoCard>

          <InfoCard label="Technology Stack" icon={Cpu} accent="chart-2" animationDelayMs={50}>
            {topTechnologies.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {topTechnologies.map((tech) => (
                  <li key={tech.technology} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {tech.technology.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Not yet analyzed</p>
            )}
          </InfoCard>

          <InfoCard label="Architecture" icon={Network} accent="chart-5" animationDelayMs={100}>
            {architecture ? (
              <p>
                {architecture.detectedPattern.replace(/_/g, ' ')}
                {architecture.targetArchitecturePattern && (
                  <>
                    {' '}
                    &rarr; <span className="font-medium">{architecture.targetArchitecturePattern.replace(/_/g, ' ')}</span>
                  </>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground">Not yet analyzed</p>
            )}
          </InfoCard>

          <InfoCard label="Current State" icon={FileText} accent="chart-8" animationDelayMs={150}>
            {architecture?.currentArchitectureDescription ? (
              <p className="line-clamp-4">{architecture.currentArchitectureDescription}</p>
            ) : (
              <p className="text-muted-foreground">Not yet analyzed</p>
            )}
          </InfoCard>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Scorecard</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard label="Security Risk" score={securityScore} icon={ShieldCheck} accent={scoreAccent(securityScore)} animationDelayMs={0} />
          <ScoreCard
            label="Performance"
            score={performance?.performanceScore ?? null}
            icon={Gauge}
            accent={scoreAccent(performance?.performanceScore ?? null)}
            animationDelayMs={50}
          />
          <ScoreCard
            label="Maintainability"
            score={maintainability}
            icon={Wrench}
            accent={scoreAccent(maintainability)}
            animationDelayMs={100}
          />
          <ScoreCard
            label="Technical Debt"
            score={technicalDebtHealthScore}
            icon={AlertOctagon}
            accent={scoreAccent(technicalDebtHealthScore)}
            description={`${technicalDebt}/100 debt level`}
            animationDelayMs={150}
          />
          <ScoreCard
            label="Cloud Readiness"
            score={cloudReadiness}
            icon={Cloud}
            accent={scoreAccent(cloudReadiness)}
            animationDelayMs={200}
          />
          <ScoreCard
            label="AI Confidence"
            score={aiConfidence}
            icon={Sparkles}
            accent={scoreAccent(aiConfidence)}
            animationDelayMs={250}
          />
          <InfoCard label="Migration Complexity" icon={Rocket} accent={plan ? levelAccent(plan.migrationComplexity) : 'chart-1'} animationDelayMs={300}>
            <p className="font-medium">{plan?.migrationComplexity ?? 'Not yet analyzed'}</p>
          </InfoCard>
          <InfoCard label="Estimated Migration Time" icon={Clock} accent="chart-3" animationDelayMs={350}>
            <p className="font-medium">{plan?.estimatedTimeline ?? 'Not yet analyzed'}</p>
          </InfoCard>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskList risks={risks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendationList recommendations={recommendations} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function levelAccent(level: string): 'good' | 'warning' | 'critical' {
  if (level === 'LOW') return 'good';
  if (level === 'MEDIUM') return 'warning';
  return 'critical';
}

function CardContentOverallScore({ score }: { score: number | null }) {
  return (
    <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Overall Modernization Score</p>
      <p className="text-5xl font-extrabold tabular-nums">{score !== null ? `${score}` : '—'}<span className="text-2xl text-muted-foreground">/100</span></p>
      <Progress value={score ?? 0} className="mt-2 w-full max-w-md" indicatorClassName={scoreBarClass(score)} />
    </CardContent>
  );
}

function scoreBarClass(score: number | null): string {
  if (score === null) return 'bg-chart-1';
  if (score >= 75) return 'bg-status-good';
  if (score >= 50) return 'bg-status-warning';
  if (score >= 25) return 'bg-status-serious';
  return 'bg-status-critical';
}
