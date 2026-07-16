/**
 * Type Definitions for the Application
 */

export interface Project {
  id: string;
  name: string;
  originalFileName: string;
  totalFiles: number;
  totalSizeBytes: number;
  fileExtensionBreakdown: Record<string, number>;
  createdAt: string;
}

/**
 * Minimal shape used only to know whether an analysis stage has run and when,
 * for the project timeline - the full report shapes aren't needed there.
 */
export interface AnalysisRecord {
  createdAt: string;
}

export interface SecurityAnalysisSummary extends AnalysisRecord {
  overallRiskScore: number;
}

export interface PerformanceAnalysisSummary extends AnalysisRecord {
  performanceScore: number;
}

export interface Scan {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  issueCount: number;
}

export interface Issue {
  id: string;
  scanId: string;
  category: 'architecture' | 'security' | 'scalability' | 'maintainability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: string;
}

export interface Recommendation {
  id: string;
  scanId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  codeExample?: string;
}

export interface Report {
  id: string;
  scanId: string;
  type: 'executive' | 'technical';
  format: 'pdf' | 'html';
  generatedAt: Date;
  path: string;
}

export type TechnologyType =
  | 'SERVLET'
  | 'JSP'
  | 'SPRING_MVC'
  | 'SPRING_XML'
  | 'JDBC'
  | 'HIBERNATE'
  | 'EJB'
  | 'COBOL'
  | 'JCL'
  | 'STRUTS';

export interface DetectedTechnology {
  technology: TechnologyType;
  confidenceScore: number;
  evidence: string[];
}

/**
 * A single detected project attribute (a version, a build tool, a packaging
 * style, ...) together with a confidence score and the evidence that
 * produced it.
 */
export interface DetectedAttribute {
  value: string;
  confidenceScore: number;
  evidence: string[];
}

export interface TechnologyDetectionResult {
  id: string;
  projectId: string;
  detectedTechnologies: DetectedTechnology[];
  javaVersion: DetectedAttribute;
  jdkVersion: DetectedAttribute;
  buildTool: DetectedAttribute;
  mavenVersion: DetectedAttribute;
  gradleVersion: DetectedAttribute;
  springVersion: DetectedAttribute;
  springBootVersion: DetectedAttribute;
  servletVersion: DetectedAttribute;
  jspVersion: DetectedAttribute;
  hibernateVersion: DetectedAttribute;
  applicationServer: DetectedAttribute;
  packaging: DetectedAttribute;
  configurationStyles: DetectedAttribute[];
  databases: DetectedAttribute[];
  createdAt: string;
}

export type ArchitecturePattern = 'MONOLITH' | 'MVC' | 'LAYERED' | 'CLIENT_SERVER' | 'MICROSERVICE';

export interface ArchitectureAnalysisResult {
  id: string;
  projectId: string;
  detectedPattern: ArchitecturePattern;
  currentArchitectureDescription: string;
  currentArchitectureDiagram: string;
  architectureScore: number;
  architectureScoreJustification: string;
  recommendations: string[];
  targetArchitecturePattern: ArchitecturePattern;
  targetArchitectureDescription: string;
  migrationDiagram: string;
  filesAnalyzed: number;
  totalProjectFiles: number;
  createdAt: string;
}

export type Level = 'LOW' | 'MEDIUM' | 'HIGH';

export type ModernTechnology =
  | 'SPRING_BOOT'
  | 'SPRING_SECURITY'
  | 'DOCKER'
  | 'KUBERNETES'
  | 'KAFKA'
  | 'REDIS'
  | 'OPENAPI'
  | 'CLOUD_MIGRATION';

export interface RequiredTechnology {
  technology: ModernTechnology;
  recommended: boolean;
  reason: string;
}

export interface PriorityMatrixItem {
  item: string;
  impact: Level;
  effort: Level;
}

export interface Risk {
  description: string;
  severity: Level;
}

export interface ModernizationPlan {
  id: string;
  projectId: string;
  migrationStrategy: string;
  estimatedTimeline: string;
  migrationComplexity: Level;
  priorityMatrix: PriorityMatrixItem[];
  quickWins: string[];
  risks: Risk[];
  requiredTechnologies: RequiredTechnology[];
  filesAnalyzed: number;
  totalProjectFiles: number;
  createdAt: string;
}

export type Role = 'ADMIN' | 'ARCHITECT' | 'DEVELOPER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
  errorCode?: string;
  timestamp?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}
