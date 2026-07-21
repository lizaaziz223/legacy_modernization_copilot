/**
 * Executive Summary derived metrics.
 *
 * None of these are backend fields - "Maintainability", "Technical Debt",
 * "Cloud Readiness", and "Overall Modernization Score" don't exist as
 * persisted values anywhere in the data model. Each is computed here from
 * fields that already exist (architecture score, security findings,
 * migration complexity, required-technology recommendations), so the
 * Executive Summary only ever reuses existing analysis data.
 */
import type {
  ArchitectureAnalysisResult,
  Level,
  ModernizationPlan,
  SecurityAnalysisSummary,
  SecurityFinding,
  SeverityLevel,
  TechnologyDetectionResult,
} from '@/types';

const CLOUD_TECHNOLOGIES = new Set(['DOCKER', 'KUBERNETES', 'CLOUD_MIGRATION']);
const SEVERITY_DEBT_WEIGHT: Record<SeverityLevel, number> = { LOW: 2, MEDIUM: 5, HIGH: 10, CRITICAL: 15 };
const SEVERITY_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
const MIGRATION_COMPLEXITY_DEBT: Record<Level, number> = { LOW: 0, MEDIUM: 10, HIGH: 20 };

export function computeMaintainability(
  architectureScore: number | null,
  findingsCount: number
): number | null {
  if (architectureScore === null) return null;
  const penalty = Math.min(40, findingsCount * 4);
  return Math.max(0, Math.round(architectureScore - penalty));
}

export function computeTechnicalDebt(
  securityFindings: SecurityFinding[],
  migrationComplexity: Level | undefined
): number {
  const findingsDebt = securityFindings.reduce(
    (sum, finding) => sum + (SEVERITY_DEBT_WEIGHT[finding.severity] ?? 5),
    0
  );
  const complexityDebt = migrationComplexity ? MIGRATION_COMPLEXITY_DEBT[migrationComplexity] : 0;
  return Math.min(100, findingsDebt + complexityDebt);
}

export function computeCloudReadiness(plan: ModernizationPlan | null): number | null {
  if (!plan) return null;
  const cloudTechs = plan.requiredTechnologies.filter((tech) => CLOUD_TECHNOLOGIES.has(tech.technology));
  if (cloudTechs.length === 0) return 70; // no cloud-related recommendation either way
  const recommendedCount = cloudTechs.filter((tech) => tech.recommended).length;
  return Math.round(100 - (recommendedCount / cloudTechs.length) * 100);
}

export function computeOverallScore(parts: (number | null)[]): number | null {
  const valid = parts.filter((part): part is number => part !== null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, part) => sum + part, 0) / valid.length);
}

export function computeAiConfidence(technology: TechnologyDetectionResult | null): number | null {
  if (!technology) return null;
  const scores = [
    ...technology.detectedTechnologies.map((detected) => detected.confidenceScore),
    technology.javaVersion.confidenceScore,
    technology.buildTool.confidenceScore,
    technology.applicationServer.confidenceScore,
  ];
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export interface UnifiedRisk {
  title: string;
  severity: string;
  source: 'Security' | 'Migration';
}

export function topRisks(
  security: SecurityAnalysisSummary | null,
  plan: ModernizationPlan | null,
  limit = 5
): UnifiedRisk[] {
  const risks: UnifiedRisk[] = [
    ...(security?.findings.map((finding) => ({
      title: finding.title,
      severity: finding.severity,
      source: 'Security' as const,
    })) ?? []),
    ...(plan?.risks.map((risk) => ({
      title: risk.description,
      severity: risk.severity,
      source: 'Migration' as const,
    })) ?? []),
  ];
  return risks.sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0)).slice(0, limit);
}

export function topRecommendations(
  architecture: ArchitectureAnalysisResult | null,
  plan: ModernizationPlan | null,
  security: SecurityAnalysisSummary | null,
  limit = 5
): string[] {
  const recommendations = [
    ...(architecture?.recommendations ?? []),
    ...(plan?.quickWins ?? []),
    ...(security?.findings.map((finding) => finding.recommendation).filter(Boolean) ?? []),
  ];
  return recommendations.slice(0, limit);
}
