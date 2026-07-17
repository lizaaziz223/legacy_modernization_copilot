/**
 * Client-side PDF generation for the Report page, using @react-pdf/renderer
 * (a pure-JS PDF renderer - no headless browser, so it's safe to run in the
 * browser on a memory-constrained deployment). Produces a real vector PDF:
 * selectable text, small file size, true pagination, page numbers.
 *
 * Colors below are hex conversions of the light-theme HSL tokens in
 * src/styles/globals.css (--primary, --secondary, --status-*, ...) - kept in
 * sync manually since react-pdf can't read CSS custom properties.
 */
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type {
  ArchitectureAnalysisResult,
  BusinessAnalysisResult,
  Level,
  ModernizationPlan,
  ModernTechnology,
  PerformanceAnalysisSummary,
  PerformanceFinding,
  Project,
  SecurityAnalysisSummary,
  SecurityFinding,
  SeverityLevel,
  TechnologyDetectionResult,
} from '@/types';
import type { CostEstimate, RiskMatrix } from '@/lib/report';
import type { UnifiedRisk } from '@/lib/executive-summary';

const COLORS = {
  primary: '#0F172A',
  secondary: '#3B82F6',
  foreground: '#020817',
  mutedForeground: '#64748B',
  border: '#E2E8F0',
  background: '#FFFFFF',
  statusGood: '#0CA30C',
  statusWarning: '#FAB219',
  statusSerious: '#EC835A',
  statusCritical: '#D03B3B',
};

const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  LOW: COLORS.statusGood,
  MEDIUM: COLORS.statusWarning,
  HIGH: COLORS.statusSerious,
  CRITICAL: COLORS.statusCritical,
};

const LEVEL_RANK: Record<Level, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const CLOUD_TECHNOLOGIES: ModernTechnology[] = ['DOCKER', 'KUBERNETES', 'CLOUD_MIGRATION'];
const MAX_LIST_ITEMS = 15;

const styles = StyleSheet.create({
  coverPage: {
    padding: 48,
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.primary,
    color: COLORS.background,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: COLORS.background },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.background },
  coverTitle: { fontSize: 30, fontFamily: 'Helvetica-Bold', marginBottom: 12, color: COLORS.background },
  coverSubtitle: { fontSize: 16, color: COLORS.background, marginBottom: 6 },
  coverMeta: { fontSize: 10, color: '#CBD5E1' },
  page: { padding: 40, paddingBottom: 56, fontFamily: 'Helvetica', fontSize: 10, color: COLORS.foreground },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  sectionHeadingBar: { width: 4, height: 16, backgroundColor: COLORS.secondary, marginRight: 8, borderRadius: 2 },
  sectionHeadingText: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: COLORS.primary },
  paragraph: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  mutedText: { fontSize: 9, color: COLORS.mutedForeground },
  bulletItem: { fontSize: 10, lineHeight: 1.5, marginBottom: 3 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statBox: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 8 },
  statLabel: { fontSize: 8, color: COLORS.mutedForeground, marginBottom: 2 },
  statValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: COLORS.primary },
  card: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 8, marginBottom: 6 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  cardTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: COLORS.background },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  tableHeaderRow: { backgroundColor: '#F1F5F9', borderTopWidth: 0 },
  tableHeaderCell: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', padding: 5, color: COLORS.mutedForeground },
  tableCell: { flex: 1, fontSize: 9, padding: 5 },
  matrixGrid: { flexDirection: 'row' },
  matrixColLabels: { flexDirection: 'row', marginLeft: 46 },
  matrixColLabel: { flex: 1, fontSize: 8, textAlign: 'center', color: COLORS.mutedForeground },
  matrixRow: { flexDirection: 'row', alignItems: 'stretch' },
  matrixRowLabel: { width: 46, fontSize: 8, color: COLORS.mutedForeground, textAlign: 'right', paddingRight: 6, paddingTop: 6 },
  matrixCell: { flex: 1, minHeight: 40, borderWidth: 1, borderColor: COLORS.border, margin: 2, padding: 4, borderRadius: 4 },
  matrixCellText: { fontSize: 7, marginBottom: 1 },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 },
  footerText: { fontSize: 8, color: COLORS.mutedForeground },
});

export interface ReportPdfData {
  project: Project;
  business: BusinessAnalysisResult | null;
  technology: TechnologyDetectionResult | null;
  architecture: ArchitectureAnalysisResult | null;
  security: SecurityAnalysisSummary | null;
  performance: PerformanceAnalysisSummary | null;
  plan: ModernizationPlan | null;
  overallScore: number | null;
  technicalDebt: number;
  cloudReadiness: number | null;
  costEstimate: CostEstimate | null;
  riskMatrix: RiskMatrix;
  topRisksList: UnifiedRisk[];
  topRecommendationsList: string[];
  generatedAt: Date;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function SectionHeading({ index, title }: { index: number; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingBar} />
      <Text style={styles.sectionHeadingText}>
        {index}. {title}
      </Text>
    </View>
  );
}

function EmptyState({ text = 'Not yet analyzed.' }: { text?: string }) {
  return <Text style={styles.mutedText}>{text}</Text>;
}

function BulletList({ items, emptyText }: { items: string[]; emptyText?: string }) {
  if (items.length === 0) return <EmptyState text={emptyText ?? 'None identified.'} />;
  return (
    <View>
      {items.slice(0, MAX_LIST_ITEMS).map((item, i) => (
        <Text key={i} style={styles.bulletItem}>
          {'•'}  {item}
        </Text>
      ))}
      {items.length > MAX_LIST_ITEMS && (
        <Text style={styles.mutedText}>+ {items.length - MAX_LIST_ITEMS} more (see the in-app report)</Text>
      )}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Table({ columns, rows }: { columns: string[]; rows: string[][] }) {
  if (rows.length === 0) return <EmptyState />;
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {columns.map((col) => (
          <Text key={col} style={styles.tableHeaderCell}>
            {col}
          </Text>
        ))}
      </View>
      {rows.slice(0, MAX_LIST_ITEMS).map((row, i) => (
        <View key={i} style={styles.tableRow}>
          {row.map((cell, j) => (
            <Text key={j} style={styles.tableCell}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function SecurityFindingsSection({ findings }: { findings: SecurityFinding[] }) {
  if (findings.length === 0) return <EmptyState />;
  return (
    <View>
      {findings.slice(0, MAX_LIST_ITEMS).map((finding, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{finding.title}</Text>
            <Badge label={finding.severity} color={SEVERITY_COLOR[finding.severity]} />
          </View>
          <Text style={styles.paragraph}>{finding.description}</Text>
          <Text style={styles.mutedText}>Recommendation: {finding.recommendation}</Text>
        </View>
      ))}
      {findings.length > MAX_LIST_ITEMS && (
        <Text style={styles.mutedText}>+ {findings.length - MAX_LIST_ITEMS} more findings (see the in-app report)</Text>
      )}
    </View>
  );
}

function PerformanceFindingsSection({ findings }: { findings: PerformanceFinding[] }) {
  if (findings.length === 0) return <EmptyState />;
  return (
    <View>
      {findings.slice(0, MAX_LIST_ITEMS).map((finding, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{finding.title}</Text>
          <Text style={styles.paragraph}>{finding.description}</Text>
          <Text style={styles.mutedText}>Optimization: {finding.optimizationSuggestion}</Text>
        </View>
      ))}
      {findings.length > MAX_LIST_ITEMS && (
        <Text style={styles.mutedText}>+ {findings.length - MAX_LIST_ITEMS} more findings (see the in-app report)</Text>
      )}
    </View>
  );
}

function RiskMatrixSection({ matrix }: { matrix: RiskMatrix }) {
  const likelihoodRows: Level[] = ['HIGH', 'MEDIUM', 'LOW'];
  const impactColumns: Level[] = ['LOW', 'MEDIUM', 'HIGH'];

  const cellColor = (likelihood: Level, impact: Level): string => {
    const rank = LEVEL_RANK[likelihood] + LEVEL_RANK[impact];
    if (rank <= 2) return '#F0FDF4';
    if (rank <= 4) return '#FFFBEB';
    if (rank === 5) return '#FFF7ED';
    return '#FEF2F2';
  };

  return (
    <View>
      <View style={styles.matrixColLabels}>
        {impactColumns.map((impact) => (
          <Text key={impact} style={styles.matrixColLabel}>
            Impact: {impact}
          </Text>
        ))}
      </View>
      {likelihoodRows.map((likelihood) => (
        <View key={likelihood} style={styles.matrixRow}>
          <Text style={styles.matrixRowLabel}>{likelihood}</Text>
          {impactColumns.map((impact) => {
            const items = matrix[likelihood][impact];
            return (
              <View key={impact} style={[styles.matrixCell, { backgroundColor: cellColor(likelihood, impact) }]}>
                {items.length === 0 ? (
                  <Text style={[styles.matrixCellText, { color: COLORS.mutedForeground }]}>&mdash;</Text>
                ) : (
                  items.slice(0, 3).map((item, i) => (
                    <Text key={i} style={styles.matrixCellText}>
                      {item.title}
                    </Text>
                  ))
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>AI Legacy Modernization Copilot &mdash; AI-generated, for planning purposes only</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function ReportDocument({ data }: { data: ReportPdfData }) {
  const {
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
    topRisksList,
    topRecommendationsList,
    generatedAt,
  } = data;

  const springBootRec = plan?.requiredTechnologies.find((tech) => tech.technology === 'SPRING_BOOT');
  const cloudTechs = plan?.requiredTechnologies.filter((tech) => CLOUD_TECHNOLOGIES.includes(tech.technology));

  return (
    <Document title={`${project.name} - Modernization Report`} author="AI Legacy Modernization Copilot">
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>ALM</Text>
          </View>
          <Text style={styles.brandText}>AI LEGACY MODERNIZATION COPILOT</Text>
        </View>

        <View>
          <Text style={styles.coverTitle}>Modernization Report</Text>
          <Text style={styles.coverSubtitle}>{project.name}</Text>
          <Text style={styles.coverMeta}>Generated {generatedAt.toLocaleString()}</Text>
          <Text style={styles.coverMeta}>{project.totalFiles} files analyzed</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <SectionHeading index={1} title="Executive Summary" />
        <View style={styles.statRow}>
          <StatBox label="Overall Modernization Score" value={overallScore !== null ? `${overallScore}/100` : '—'} />
          <StatBox label="Technical Debt" value={`${technicalDebt}/100`} />
          <StatBox label="Cloud Readiness" value={cloudReadiness !== null ? `${cloudReadiness}%` : '—'} />
        </View>
        {business?.businessPurpose ? (
          <Text style={styles.paragraph}>{business.businessPurpose}</Text>
        ) : (
          <EmptyState text="Run business analysis to see a business purpose summary." />
        )}
        <Text style={[styles.cardTitle, { marginTop: 4, marginBottom: 4 }]}>Top Risks</Text>
        <BulletList items={topRisksList.map((risk) => `[${risk.severity}] ${risk.title} (${risk.source})`)} />
        <Text style={[styles.cardTitle, { marginTop: 8, marginBottom: 4 }]}>Top Recommendations</Text>
        <BulletList items={topRecommendationsList} />

        <SectionHeading index={2} title="Architecture" />
        {architecture ? (
          <>
            <View style={styles.statRow}>
              <StatBox label="Architecture Score" value={`${architecture.architectureScore}/100`} />
              <StatBox label="Current Pattern" value={architecture.detectedPattern.replace(/_/g, ' ')} />
              <StatBox label="Target Pattern" value={architecture.targetArchitecturePattern.replace(/_/g, ' ')} />
            </View>
            <Text style={styles.paragraph}>{architecture.currentArchitectureDescription}</Text>
            <Text style={styles.paragraph}>{architecture.architectureScoreJustification}</Text>
            <Text style={[styles.cardTitle, { marginBottom: 4 }]}>Recommendations</Text>
            <BulletList items={architecture.recommendations} />
          </>
        ) : (
          <EmptyState text="Run architecture analysis to see results." />
        )}

        <SectionHeading index={3} title="Security" />
        {security ? (
          <>
            <View style={styles.statRow}>
              <StatBox label="Overall Risk Score" value={`${security.overallRiskScore}/100`} />
              <StatBox label="Findings" value={`${security.findings.length}`} />
            </View>
            <SecurityFindingsSection findings={security.findings} />
          </>
        ) : (
          <EmptyState text="Run security analysis to see results." />
        )}

        <SectionHeading index={4} title="Performance" />
        {performance ? (
          <>
            <View style={styles.statRow}>
              <StatBox label="Performance Score" value={`${performance.performanceScore}/100`} />
              <StatBox label="Findings" value={`${performance.findings.length}`} />
            </View>
            <Text style={styles.paragraph}>{performance.performanceScoreJustification}</Text>
            <PerformanceFindingsSection findings={performance.findings} />
          </>
        ) : (
          <EmptyState text="Run performance analysis to see results." />
        )}

        <SectionHeading index={5} title="Technology" />
        {technology ? (
          <>
            <View style={styles.statRow}>
              <StatBox label="Java" value={technology.javaVersion.value || 'Not detected'} />
              <StatBox label="Build Tool" value={technology.buildTool.value || 'Not detected'} />
              <StatBox label="App Server" value={technology.applicationServer.value || 'Not detected'} />
            </View>
            <Text style={[styles.cardTitle, { marginBottom: 4 }]}>Detected Technologies</Text>
            <BulletList
              items={technology.detectedTechnologies
                .slice(0, MAX_LIST_ITEMS)
                .map((tech) => `${tech.technology.replace(/_/g, ' ')} (${tech.confidenceScore}% confidence)`)}
            />
          </>
        ) : (
          <EmptyState text="Run technology detection to see results." />
        )}

        <SectionHeading index={6} title="Technical Debt" />
        <View style={styles.statRow}>
          <StatBox label="Technical Debt Level" value={`${technicalDebt}/100`} />
        </View>
        <Text style={styles.mutedText}>
          Derived from security finding severity and migration complexity - higher means more accumulated debt to
          address during modernization.
        </Text>

        <SectionHeading index={7} title="Migration Roadmap" />
        {plan ? (
          <>
            <Text style={styles.paragraph}>{plan.migrationStrategy}</Text>
            <View style={styles.statRow}>
              <StatBox label="Estimated Timeline" value={plan.estimatedTimeline} />
              <StatBox label="Migration Complexity" value={plan.migrationComplexity} />
            </View>
            <Text style={[styles.cardTitle, { marginBottom: 4 }]}>Priority Matrix</Text>
            <Table
              columns={['Item', 'Impact', 'Effort']}
              rows={plan.priorityMatrix.map((row) => [row.item, row.impact, row.effort])}
            />
            <Text style={[styles.cardTitle, { marginTop: 8, marginBottom: 4 }]}>Quick Wins</Text>
            <BulletList items={plan.quickWins} />
            <Text style={[styles.cardTitle, { marginTop: 8, marginBottom: 4 }]}>Risks</Text>
            <BulletList items={plan.risks.map((risk) => `[${risk.severity}] ${risk.description}`)} />
          </>
        ) : (
          <EmptyState text="Generate a modernization roadmap to see results." />
        )}

        <SectionHeading index={8} title="Spring Boot Recommendation" />
        {springBootRec ? (
          <Text style={styles.paragraph}>
            {springBootRec.recommended ? 'Recommended: ' : 'Not recommended: '}
            {springBootRec.reason}
          </Text>
        ) : (
          <EmptyState text="Generate a modernization roadmap to see a Spring Boot recommendation." />
        )}
        {technology && (
          <View style={styles.statRow}>
            <StatBox label="Java" value={technology.javaVersion.value || 'Not detected'} />
            <StatBox label="Spring" value={technology.springVersion.value || 'Not detected'} />
            <StatBox label="Spring Boot" value={technology.springBootVersion.value || 'Not detected'} />
          </View>
        )}

        <SectionHeading index={9} title="Cloud Recommendation" />
        <View style={styles.statRow}>
          <StatBox label="Cloud Readiness" value={cloudReadiness !== null ? `${cloudReadiness}%` : '—'} />
        </View>
        <BulletList
          items={(cloudTechs ?? []).map(
            (tech) => `${tech.recommended ? 'Recommended' : 'Not recommended'}: ${tech.technology.replace(/_/g, ' ')} - ${tech.reason}`
          )}
          emptyText="No cloud-specific recommendations were generated for this project yet."
        />

        <SectionHeading index={10} title="Estimated Cost" />
        {costEstimate ? (
          <>
            <View style={styles.statRow}>
              <StatBox label="Estimated Range" value={`${formatUsd(costEstimate.low)} - ${formatUsd(costEstimate.high)}`} />
            </View>
            <BulletList items={costEstimate.basis} />
            <Text style={styles.mutedText}>
              Rough, AI-generated order-of-magnitude estimate derived from project size and analysis findings -
              not a quote.
            </Text>
          </>
        ) : (
          <EmptyState text="Generate a modernization roadmap to see a cost estimate." />
        )}

        <SectionHeading index={11} title="Estimated Timeline" />
        {plan ? (
          <View style={styles.statRow}>
            <StatBox label="Estimated Timeline" value={plan.estimatedTimeline} />
            <StatBox label="Quick Wins" value={`${plan.quickWins.length} items`} />
            <StatBox label="Remaining Roadmap Items" value={`${plan.priorityMatrix.length} items`} />
          </View>
        ) : (
          <EmptyState text="Generate a modernization roadmap to see a timeline." />
        )}

        <SectionHeading index={12} title="Risk Matrix" />
        <Text style={styles.mutedText}>
          Rows = likelihood, columns = impact. Migration risks are plotted on the diagonal since the roadmap only
          records a single severity.
        </Text>
        <View style={{ marginTop: 6 }}>
          <RiskMatrixSection matrix={riskMatrix} />
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

export async function generateReportPdfBlob(data: ReportPdfData): Promise<Blob> {
  return pdf(<ReportDocument data={data} />).toBlob();
}
