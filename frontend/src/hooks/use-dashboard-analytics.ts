'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  projectService,
  technologyDetectionService,
  architectureAnalysisService,
  securityAnalysisStatusService,
  performanceAnalysisStatusService,
  modernizationPlanService,
} from '@/services';
import type {
  Project,
  TechnologyDetectionResult,
  ArchitectureAnalysisResult,
  SecurityAnalysisSummary,
  PerformanceAnalysisSummary,
  ModernizationPlan,
  Level,
} from '@/types';

interface ProjectAnalyses {
  project: Project;
  technology: TechnologyDetectionResult | null;
  architecture: ArchitectureAnalysisResult | null;
  security: SecurityAnalysisSummary | null;
  performance: PerformanceAnalysisSummary | null;
  plan: ModernizationPlan | null;
}

interface NamedValue {
  name: string;
  value: number;
}

interface RecentActivityEntry {
  projectId: string;
  projectName: string;
  stage: string;
  completedAt: string;
}

export interface DashboardAnalytics {
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
  projects: Project[];
  analyses: ProjectAnalyses[];
  metrics: {
    projectCount: number;
    totalFiles: number;
    estimatedLinesOfCode: number;
    distinctTechnologies: number;
    architectureScore: number | null;
    securityScore: number | null;
    performanceScore: number | null;
    migrationReadiness: number | null;
    cloudReadiness: number | null;
    aiConfidence: number | null;
  };
  technologyDistribution: NamedValue[];
  complexityDistribution: NamedValue[];
  securitySeverityDistribution: NamedValue[];
  migrationTimeline: { name: string; months: number }[];
  architectureHealth: { name: string; score: number }[];
  recentUploads: Project[];
  recentAnalyses: RecentActivityEntry[];
  recentReports: RecentActivityEntry[];
}

const RECENT_LIMIT = 5;

// The extraction pipeline records file counts and byte sizes, not line counts.
// ~45 bytes/line is a reasonable blended average across the supported source
// types (Java/XML/properties/SQL), so this derives an estimate from data that
// already exists rather than requiring a new backend field.
const BYTES_PER_LINE_ESTIMATE = 45;

const MIGRATION_COMPLEXITY_READINESS: Record<Level, number> = { LOW: 90, MEDIUM: 55, HIGH: 25 };
const CLOUD_TECHNOLOGIES = new Set(['DOCKER', 'KUBERNETES', 'CLOUD_MIGRATION']);

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/**
 * The modernization plan's estimated timeline is free-form LLM text (e.g.
 * "3-6 months"), not a structured duration - this parses the common shapes
 * into an approximate month count for the Migration Timeline chart.
 */
function parseEstimatedMonths(timeline: string): number | null {
  const rangeMatch = timeline.match(/(\d+)\s*-\s*(\d+)\s*(week|month|year)/i);
  if (rangeMatch) {
    const value = (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
    return normalizeToMonths(value, rangeMatch[3]);
  }
  const singleMatch = timeline.match(/(\d+)\+?\s*(week|month|year)/i);
  if (singleMatch) {
    return normalizeToMonths(Number(singleMatch[1]), singleMatch[2]);
  }
  return null;
}

function normalizeToMonths(value: number, unit: string): number {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit.startsWith('week')) return value / 4.33;
  if (lowerUnit.startsWith('year')) return value * 12;
  return value;
}

async function loadProjectAnalyses(project: Project): Promise<ProjectAnalyses> {
  const [technology, architecture, security, performance, plan] = await Promise.allSettled([
    technologyDetectionService.get(project.id),
    architectureAnalysisService.get(project.id),
    securityAnalysisStatusService.get(project.id),
    performanceAnalysisStatusService.get(project.id),
    modernizationPlanService.get(project.id),
  ]);

  return {
    project,
    technology: technology.status === 'fulfilled' ? technology.value : null,
    architecture: architecture.status === 'fulfilled' ? architecture.value : null,
    security: security.status === 'fulfilled' ? security.value : null,
    performance: performance.status === 'fulfilled' ? performance.value : null,
    plan: plan.status === 'fulfilled' ? plan.value : null,
  };
}

/**
 * Aggregates the Executive Dashboard's metrics/charts/activity feeds entirely
 * client-side from existing per-project endpoints (no new backend routes) -
 * tolerating projects that haven't had every analysis stage run yet.
 */
export function useDashboardAnalytics(): DashboardAnalytics {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [analyses, setAnalyses] = useState<ProjectAnalyses[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    projectService
      .list()
      .then((projects) => Promise.all(projects.map(loadProjectAnalyses)))
      .then((results) => {
        if (!cancelled) {
          setAnalyses(results);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAnalyses([]);
          setIsError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const projects = analyses.map((entry) => entry.project);
  const totalFiles = projects.reduce((sum, project) => sum + project.totalFiles, 0);
  const estimatedLinesOfCode = Math.round(
    projects.reduce((sum, project) => sum + project.totalSizeBytes, 0) / BYTES_PER_LINE_ESTIMATE
  );

  const technologyCounts = new Map<string, number>();
  const confidenceScores: number[] = [];
  analyses.forEach(({ technology }) => {
    technology?.detectedTechnologies.forEach((detected) => {
      technologyCounts.set(detected.technology, (technologyCounts.get(detected.technology) ?? 0) + 1);
      confidenceScores.push(detected.confidenceScore);
    });
    if (technology) {
      confidenceScores.push(
        technology.javaVersion.confidenceScore,
        technology.buildTool.confidenceScore,
        technology.applicationServer.confidenceScore
      );
    }
  });

  const architectureScores = analyses
    .map((entry) => entry.architecture?.architectureScore)
    .filter((score): score is number => score !== undefined);
  const securityRiskScores = analyses
    .map((entry) => entry.security?.overallRiskScore)
    .filter((score): score is number => score !== undefined);
  const performanceScores = analyses
    .map((entry) => entry.performance?.performanceScore)
    .filter((score): score is number => score !== undefined);

  const migrationReadinessScores = analyses
    .map((entry) => entry.plan?.migrationComplexity)
    .filter((complexity): complexity is Level => complexity !== undefined)
    .map((complexity) => MIGRATION_COMPLEXITY_READINESS[complexity] ?? 50);

  const cloudReadinessScores = analyses
    .filter((entry) => entry.plan)
    .map((entry) => {
      const cloudTechs = entry.plan!.requiredTechnologies.filter((tech) => CLOUD_TECHNOLOGIES.has(tech.technology));
      if (cloudTechs.length === 0) return 70; // no cloud-related recommendation either way
      const recommendedCount = cloudTechs.filter((tech) => tech.recommended).length;
      return Math.round(100 - (recommendedCount / cloudTechs.length) * 100);
    });

  const complexityDistribution = ['LOW', 'MEDIUM', 'HIGH']
    .map((level) => ({
      name: level,
      value: analyses.filter((entry) => entry.plan?.migrationComplexity === level).length,
    }))
    .filter((entry) => entry.value > 0);

  const severityCounts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  analyses.forEach((entry) => {
    entry.security?.findings.forEach((finding) => {
      severityCounts[finding.severity] = (severityCounts[finding.severity] ?? 0) + 1;
    });
  });
  const securitySeverityDistribution = Object.entries(severityCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((entry) => entry.value > 0);

  const migrationTimeline = analyses
    .map((entry) => {
      if (!entry.plan) return null;
      const months = parseEstimatedMonths(entry.plan.estimatedTimeline);
      return months === null ? null : { name: entry.project.name, months: Math.round(months * 10) / 10 };
    })
    .filter((entry): entry is { name: string; months: number } => entry !== null);

  const architectureHealth = analyses
    .filter((entry) => entry.architecture)
    .map((entry) => ({ name: entry.project.name, score: entry.architecture!.architectureScore }));

  const recentUploads = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_LIMIT);

  const recentAnalyses = analyses
    .flatMap((entry) =>
      [
        entry.technology && { stage: 'Technology Detection', completedAt: entry.technology.createdAt },
        entry.architecture && { stage: 'Architecture Analysis', completedAt: entry.architecture.createdAt },
        entry.security && { stage: 'Security Analysis', completedAt: entry.security.createdAt },
        entry.performance && { stage: 'Performance Analysis', completedAt: entry.performance.createdAt },
      ]
        .filter((stage): stage is { stage: string; completedAt: string } => Boolean(stage))
        .map((stage) => ({ projectId: entry.project.id, projectName: entry.project.name, ...stage }))
    )
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, RECENT_LIMIT);

  const recentReports = analyses
    .filter((entry) => entry.plan)
    .map((entry) => ({
      projectId: entry.project.id,
      projectName: entry.project.name,
      stage: 'Modernization Plan',
      completedAt: entry.plan!.createdAt,
    }))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, RECENT_LIMIT);

  return {
    isLoading,
    isError,
    reload,
    projects,
    analyses,
    metrics: {
      projectCount: projects.length,
      totalFiles,
      estimatedLinesOfCode,
      distinctTechnologies: technologyCounts.size,
      architectureScore: average(architectureScores),
      securityScore: average(securityRiskScores.map((score) => 100 - score)),
      performanceScore: average(performanceScores),
      migrationReadiness: average(migrationReadinessScores),
      cloudReadiness: average(cloudReadinessScores),
      aiConfidence: average(confidenceScores),
    },
    technologyDistribution: Array.from(technologyCounts.entries()).map(([name, value]) => ({ name, value })),
    complexityDistribution,
    securitySeverityDistribution,
    migrationTimeline,
    architectureHealth,
    recentUploads,
    recentAnalyses,
    recentReports,
  };
}
