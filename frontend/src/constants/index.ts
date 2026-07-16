/**
 * API Constants
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',

  // Projects
  PROJECTS_LIST: '/projects',
  PROJECTS_UPLOAD: '/projects',
  PROJECTS_GET: (id: string) => `/projects/${id}`,
  PROJECTS_DOWNLOAD: (id: string) => `/projects/${id}/download`,

  // Technology Detection
  TECHNOLOGY_DETECTION: (projectId: string) => `/projects/${projectId}/technology-detection`,

  // Architecture Analysis
  ARCHITECTURE_ANALYSIS: (projectId: string) => `/projects/${projectId}/architecture-analysis`,

  // Modernization Plan
  MODERNIZATION_PLAN: (projectId: string) => `/projects/${projectId}/modernization-plan`,

  // Business Analysis
  BUSINESS_ANALYSIS: (projectId: string) => `/projects/${projectId}/business-analysis`,

  // Security Analysis
  SECURITY_ANALYSIS: (projectId: string) => `/projects/${projectId}/security-analysis`,

  // Performance Analysis
  PERFORMANCE_ANALYSIS: (projectId: string) => `/projects/${projectId}/performance-analysis`,

  // Spring Boot Generation
  SPRING_BOOT_GENERATION: (projectId: string) => `/projects/${projectId}/spring-boot-generation`,

  // Modernization Report
  MODERNIZATION_REPORT: (projectId: string) => `/projects/${projectId}/modernization-report`,

  // Scans
  SCANS_LIST: (projectId: string) => `/projects/${projectId}/scans`,
  SCANS_CREATE: (projectId: string) => `/projects/${projectId}/scans`,
  SCANS_GET: (scanId: string) => `/scans/${scanId}`,
  SCANS_STATUS: (scanId: string) => `/scans/${scanId}/status`,
  SCANS_RERUN: (scanId: string) => `/scans/${scanId}/rerun`,

  // Artifacts
  ARTIFACTS_UPLOAD: (projectId: string) => `/projects/${projectId}/artifacts/upload`,
  ARTIFACTS_LIST: (projectId: string) => `/projects/${projectId}/artifacts`,
  ARTIFACTS_GET: (artifactId: string) => `/artifacts/${artifactId}`,

  // Analysis
  ISSUES_LIST: (scanId: string) => `/scans/${scanId}/issues`,
  RECOMMENDATIONS_LIST: (scanId: string) => `/scans/${scanId}/recommendations`,
  REPORTS_LIST: (scanId: string) => `/scans/${scanId}/reports`,
  DIAGRAMS_LIST: (scanId: string) => `/scans/${scanId}/diagrams`,

  // Reports
  REPORTS_CREATE: (scanId: string) => `/scans/${scanId}/reports`,
  REPORTS_GET: (reportId: string) => `/reports/${reportId}`,
  REPORTS_DOWNLOAD: (reportId: string) => `/reports/${reportId}/download`,
};

/**
 * UI Constants
 */
export const PAGINATION_LIMIT = 10;
export const TOAST_DURATION = 3000;
export const UNDO_TOAST_DURATION = 10000;

/**
 * Navigation
 */
export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Upload', href: '/upload', icon: 'Upload' },
  { label: 'Analysis', href: '/analysis', icon: 'BarChart3' },
  { label: 'Reports', href: '/reports', icon: 'FileText' },
  { label: 'Architecture', href: '/architecture-viewer', icon: 'GitBranch' },
  { label: 'History', href: '/history', icon: 'History' },
  { label: 'Profile', href: '/profile', icon: 'User' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

/**
 * Issue Categories
 */
export const ISSUE_CATEGORIES = ['architecture', 'security', 'scalability', 'maintainability'] as const;

/**
 * Issue Severities
 */
export const ISSUE_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;

/**
 * Scan Status
 */
export const SCAN_STATUS = ['pending', 'running', 'completed', 'failed'] as const;
