/**
 * Report page derived metrics.
 *
 * "Estimated Cost" and the "Risk Matrix" don't exist as persisted backend
 * values - both are heuristics computed here from fields that already exist
 * (project size, migration complexity, security findings, migration risks),
 * following the same approach as src/lib/executive-summary.ts. Neither is a
 * quote or a guarantee; both say so wherever they're displayed.
 */
import type { Level, ModernizationPlan, Project, SecurityAnalysisSummary, SeverityLevel } from '@/types';

const BASE_RATE_PER_FILE = 150; // blended engineering rate proxy, USD per analyzed file
const COMPLEXITY_MULTIPLIER: Record<Level, number> = { LOW: 1, MEDIUM: 1.5, HIGH: 2.2 };
const FINDING_SURCHARGE = 400; // USD per security/performance finding, remediation effort

export interface CostEstimate {
  low: number;
  high: number;
  basis: string[];
}

export function computeCostEstimate(
  project: Project,
  plan: ModernizationPlan | null,
  findingsCount: number
): CostEstimate | null {
  if (!plan) return null;

  const multiplier = COMPLEXITY_MULTIPLIER[plan.migrationComplexity];
  const midpoint = project.totalFiles * BASE_RATE_PER_FILE * multiplier + findingsCount * FINDING_SURCHARGE;
  const low = Math.round((midpoint * 0.75) / 1000) * 1000;
  const high = Math.round((midpoint * 1.25) / 1000) * 1000;

  return {
    low,
    high,
    basis: [
      `${project.totalFiles} files analyzed at an estimated $${BASE_RATE_PER_FILE}/file blended engineering rate`,
      `${plan.migrationComplexity.toLowerCase()} migration complexity (${multiplier}x multiplier)`,
      `${findingsCount} security/performance findings requiring remediation (~$${FINDING_SURCHARGE} each)`,
    ],
  };
}

export interface RiskMatrixItem {
  title: string;
  source: 'Security' | 'Migration';
}

export type RiskMatrix = Record<Level, Record<Level, RiskMatrixItem[]>>;

const IMPACT_FROM_SEVERITY: Record<SeverityLevel, Level> = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'HIGH',
};

function likelihoodFromRiskScore(riskScore: number): Level {
  if (riskScore >= 70) return 'HIGH';
  if (riskScore >= 40) return 'MEDIUM';
  return 'LOW';
}

function emptyMatrix(): RiskMatrix {
  return {
    LOW: { LOW: [], MEDIUM: [], HIGH: [] },
    MEDIUM: { LOW: [], MEDIUM: [], HIGH: [] },
    HIGH: { LOW: [], MEDIUM: [], HIGH: [] },
  };
}

/**
 * Buckets known risks into a Likelihood x Impact grid (rows = likelihood,
 * columns = impact).
 *
 * Security findings map naturally: impact from severity, likelihood from the
 * finding's risk score. Migration risks (`plan.risks`) only record a single
 * severity with no separate likelihood, so those are plotted on the diagonal
 * (impact = likelihood = severity) as a conservative default.
 */
export function buildRiskMatrix(security: SecurityAnalysisSummary | null, plan: ModernizationPlan | null): RiskMatrix {
  const matrix = emptyMatrix();

  for (const finding of security?.findings ?? []) {
    const impact = IMPACT_FROM_SEVERITY[finding.severity];
    const likelihood = likelihoodFromRiskScore(finding.riskScore);
    matrix[likelihood][impact].push({ title: finding.title, source: 'Security' });
  }

  for (const risk of plan?.risks ?? []) {
    matrix[risk.severity][risk.severity].push({ title: risk.description, source: 'Migration' });
  }

  return matrix;
}
