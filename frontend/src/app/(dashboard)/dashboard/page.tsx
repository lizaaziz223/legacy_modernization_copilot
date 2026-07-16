'use client';

import {
  FolderKanban,
  Files,
  Code2,
  Cpu,
  Network,
  ShieldCheck,
  Gauge,
  Rocket,
  Cloud,
  Sparkles,
  Upload,
  FileText,
  ScanSearch,
} from 'lucide-react';
import { MetricCard, scoreAccent, SystemStatusCard, RecentActivityList, QuickActions } from '@/components/dashboard';
import type { MetricAccent } from '@/components/dashboard';
import {
  TechnologyDistributionChart,
  ProjectComplexityChart,
  SecuritySeverityChart,
  MigrationTimelineChart,
  ArchitectureHealthChart,
} from '@/components/charts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useDashboardAnalytics } from '@/hooks';
import { formatBytes } from '@/utils';

export default function DashboardPage() {
  const analytics = useDashboardAnalytics();
  const { metrics, isLoading } = analytics;
  const mostRecentProject = analytics.recentUploads[0] ?? null;

  const metricCards: { label: string; value: string; icon: typeof FolderKanban; accent: MetricAccent; hint?: string }[] = [
    { label: 'Projects', value: String(metrics.projectCount), icon: FolderKanban, accent: 'chart-1' },
    { label: 'Files', value: metrics.totalFiles.toLocaleString(), icon: Files, accent: 'chart-2' },
    {
      label: 'Est. Lines of Code',
      value: metrics.estimatedLinesOfCode.toLocaleString(),
      icon: Code2,
      accent: 'chart-3',
      hint: 'Estimated from file size',
    },
    { label: 'Detected Technologies', value: String(metrics.distinctTechnologies), icon: Cpu, accent: 'chart-5' },
    {
      label: 'Architecture Score',
      value: metrics.architectureScore !== null ? `${metrics.architectureScore}/100` : '—',
      icon: Network,
      accent: scoreAccent(metrics.architectureScore),
    },
    {
      label: 'Security Score',
      value: metrics.securityScore !== null ? `${metrics.securityScore}/100` : '—',
      icon: ShieldCheck,
      accent: scoreAccent(metrics.securityScore),
    },
    {
      label: 'Performance Score',
      value: metrics.performanceScore !== null ? `${metrics.performanceScore}/100` : '—',
      icon: Gauge,
      accent: scoreAccent(metrics.performanceScore),
    },
    {
      label: 'Migration Readiness',
      value: metrics.migrationReadiness !== null ? `${metrics.migrationReadiness}%` : '—',
      icon: Rocket,
      accent: scoreAccent(metrics.migrationReadiness),
    },
    {
      label: 'Cloud Readiness',
      value: metrics.cloudReadiness !== null ? `${metrics.cloudReadiness}%` : '—',
      icon: Cloud,
      accent: scoreAccent(metrics.cloudReadiness),
    },
    {
      label: 'AI Confidence',
      value: metrics.aiConfidence !== null ? `${metrics.aiConfidence}%` : '—',
      icon: Sparkles,
      accent: scoreAccent(metrics.aiConfidence),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Executive AI Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A real-time overview of every legacy modernization project and its AI-generated analysis.
        </p>
      </div>

      <SystemStatusCard />

      <QuickActions mostRecentProject={mostRecentProject} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricCards.map((card, index) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              accent={card.accent}
              hint={card.hint}
              animationDelayMs={index * 50}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Technology Distribution</CardTitle>
            <CardDescription>Detected technologies across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <TechnologyDistributionChart data={analytics.technologyDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Complexity</CardTitle>
            <CardDescription>Migration complexity across all modernization plans</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectComplexityChart data={analytics.complexityDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Severity</CardTitle>
            <CardDescription>Security findings by severity, across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <SecuritySeverityChart data={analytics.securitySeverityDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Migration Timeline</CardTitle>
            <CardDescription>Estimated migration duration per project</CardDescription>
          </CardHeader>
          <CardContent>
            <MigrationTimelineChart data={analytics.migrationTimeline} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Architecture Health</CardTitle>
            <CardDescription>Architecture score per project</CardDescription>
          </CardHeader>
          <CardContent>
            <ArchitectureHealthChart data={analytics.architectureHealth} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityList
              icon={Upload}
              emptyMessage="No projects uploaded yet."
              items={analytics.recentUploads.map((project) => ({
                id: project.id,
                title: project.name,
                subtitle: `${project.totalFiles} files · ${formatBytes(project.totalSizeBytes)}`,
                timestamp: project.createdAt,
                href: `/projects/${project.id}`,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityList
              icon={FileText}
              emptyMessage="No modernization plans generated yet."
              items={analytics.recentReports.map((entry) => ({
                id: `${entry.projectId}-${entry.stage}`,
                title: entry.projectName,
                subtitle: entry.stage,
                timestamp: entry.completedAt,
                href: `/projects/${entry.projectId}`,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityList
              icon={ScanSearch}
              emptyMessage="No analyses run yet."
              items={analytics.recentAnalyses.map((entry) => ({
                id: `${entry.projectId}-${entry.stage}`,
                title: entry.projectName,
                subtitle: entry.stage,
                timestamp: entry.completedAt,
                href: `/projects/${entry.projectId}`,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
