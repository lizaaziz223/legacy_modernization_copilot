/**
 * Service Layer - API Integration
 */

import { AxiosProgressEvent } from 'axios';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import {
  ApiResponse,
  AuthTokenResponse,
  Project,
  Scan,
  Issue,
  Recommendation,
  Report,
  HealthStatus,
  Role,
  User,
  TechnologyDetectionResult,
  ArchitectureAnalysisResult,
  ModernizationPlan,
  AnalysisRecord,
  BusinessAnalysisResult,
  SecurityAnalysisSummary,
  PerformanceAnalysisSummary,
} from '@/types';
import { getRefreshToken } from '@/utils/auth';

/**
 * Health Service
 */
export const healthService = {
  check: async (): Promise<HealthStatus> => {
    const response = await apiClient.get<HealthStatus>(API_ENDPOINTS.HEALTH);
    return response.data;
  },
};

/**
 * Authentication Service
 */
export const authService = {
  login: async (email: string, password: string): Promise<AuthTokenResponse> => {
    const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(API_ENDPOINTS.AUTH_LOGIN, {
      email,
      password,
    });
    return response.data.data;
  },
  register: async (name: string, email: string, password: string, role: Role): Promise<AuthTokenResponse> => {
    const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(API_ENDPOINTS.AUTH_REGISTER, {
      name,
      email,
      password,
      role,
    });
    return response.data.data;
  },
  logout: async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT, { refreshToken });
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH_ME);
    return response.data.data;
  },
};

/**
 * Project Service
 */
export const projectService = {
  list: async (): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<Project[]>>(API_ENDPOINTS.PROJECTS_LIST);
    return response.data.data;
  },
  upload: async (
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<Project> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.upload<ApiResponse<Project>>(API_ENDPOINTS.PROJECTS_UPLOAD, formData, {
      onUploadProgress,
    });
    return response.data.data;
  },
  get: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(API_ENDPOINTS.PROJECTS_GET(id));
    return response.data.data;
  },
  rename: async (id: string, name: string): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(API_ENDPOINTS.PROJECTS_GET(id), { name });
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.PROJECTS_GET(id));
  },
  downloadZip: async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.PROJECTS_DOWNLOAD(id), {
      responseType: 'blob',
    });
    return response.data;
  },
};

/**
 * Technology Detection Service
 */
export const technologyDetectionService = {
  run: async (projectId: string): Promise<TechnologyDetectionResult> => {
    const response = await apiClient.post<ApiResponse<TechnologyDetectionResult>>(
      API_ENDPOINTS.TECHNOLOGY_DETECTION(projectId)
    );
    return response.data.data;
  },
  get: async (projectId: string): Promise<TechnologyDetectionResult> => {
    const response = await apiClient.get<ApiResponse<TechnologyDetectionResult>>(
      API_ENDPOINTS.TECHNOLOGY_DETECTION(projectId)
    );
    return response.data.data;
  },
};

/**
 * Architecture Analysis Service
 */
export const architectureAnalysisService = {
  run: async (projectId: string): Promise<ArchitectureAnalysisResult> => {
    const response = await apiClient.post<ApiResponse<ArchitectureAnalysisResult>>(
      API_ENDPOINTS.ARCHITECTURE_ANALYSIS(projectId)
    );
    return response.data.data;
  },
  get: async (projectId: string): Promise<ArchitectureAnalysisResult> => {
    const response = await apiClient.get<ApiResponse<ArchitectureAnalysisResult>>(
      API_ENDPOINTS.ARCHITECTURE_ANALYSIS(projectId)
    );
    return response.data.data;
  },
};

/**
 * Modernization Plan Service
 */
export const modernizationPlanService = {
  run: async (projectId: string): Promise<ModernizationPlan> => {
    const response = await apiClient.post<ApiResponse<ModernizationPlan>>(
      API_ENDPOINTS.MODERNIZATION_PLAN(projectId)
    );
    return response.data.data;
  },
  get: async (projectId: string): Promise<ModernizationPlan> => {
    const response = await apiClient.get<ApiResponse<ModernizationPlan>>(
      API_ENDPOINTS.MODERNIZATION_PLAN(projectId)
    );
    return response.data.data;
  },
};

/**
 * Timeline-only status services: these agents have no dedicated UI yet, but
 * the project timeline needs to know whether/when each has run.
 */
export const businessAnalysisStatusService = {
  get: async (projectId: string): Promise<BusinessAnalysisResult> => {
    const response = await apiClient.get<ApiResponse<BusinessAnalysisResult>>(API_ENDPOINTS.BUSINESS_ANALYSIS(projectId));
    return response.data.data;
  },
};

export const securityAnalysisStatusService = {
  get: async (projectId: string): Promise<SecurityAnalysisSummary> => {
    const response = await apiClient.get<ApiResponse<SecurityAnalysisSummary>>(
      API_ENDPOINTS.SECURITY_ANALYSIS(projectId)
    );
    return response.data.data;
  },
};

export const performanceAnalysisStatusService = {
  get: async (projectId: string): Promise<PerformanceAnalysisSummary> => {
    const response = await apiClient.get<ApiResponse<PerformanceAnalysisSummary>>(
      API_ENDPOINTS.PERFORMANCE_ANALYSIS(projectId)
    );
    return response.data.data;
  },
};

export const springBootGenerationStatusService = {
  get: async (projectId: string): Promise<AnalysisRecord> => {
    const response = await apiClient.get<ApiResponse<AnalysisRecord>>(API_ENDPOINTS.SPRING_BOOT_GENERATION(projectId));
    return response.data.data;
  },
};

/**
 * Modernization Report Service
 */
export const modernizationReportService = {
  downloadPdf: async (projectId: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.MODERNIZATION_REPORT(projectId), {
      responseType: 'blob',
    });
    return response.data;
  },
};

/**
 * Scan Service
 */
export const scanService = {
  list: async (projectId: string): Promise<Scan[]> => {
    const response = await apiClient.get<Scan[]>(API_ENDPOINTS.SCANS_LIST(projectId));
    return response.data;
  },
  create: async (projectId: string): Promise<Scan> => {
    const response = await apiClient.post<Scan>(API_ENDPOINTS.SCANS_CREATE(projectId), {});
    return response.data;
  },
  get: async (scanId: string): Promise<Scan> => {
    const response = await apiClient.get<Scan>(API_ENDPOINTS.SCANS_GET(scanId));
    return response.data;
  },
  getStatus: async (scanId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.SCANS_STATUS(scanId));
    return response.data;
  },
  rerun: async (scanId: string): Promise<Scan> => {
    const response = await apiClient.post<Scan>(API_ENDPOINTS.SCANS_RERUN(scanId), {});
    return response.data;
  },
};

/**
 * Analysis Service
 */
export const analysisService = {
  getIssues: async (scanId: string): Promise<Issue[]> => {
    const response = await apiClient.get<Issue[]>(API_ENDPOINTS.ISSUES_LIST(scanId));
    return response.data;
  },
  getRecommendations: async (scanId: string): Promise<Recommendation[]> => {
    const response = await apiClient.get<Recommendation[]>(API_ENDPOINTS.RECOMMENDATIONS_LIST(scanId));
    return response.data;
  },
};

/**
 * Report Service
 */
export const reportService = {
  list: async (scanId: string): Promise<Report[]> => {
    const response = await apiClient.get<Report[]>(API_ENDPOINTS.REPORTS_LIST(scanId));
    return response.data;
  },
  create: async (scanId: string, type: string): Promise<Report> => {
    const response = await apiClient.post<Report>(API_ENDPOINTS.REPORTS_CREATE(scanId), { type });
    return response.data;
  },
  get: async (reportId: string): Promise<Report> => {
    const response = await apiClient.get<Report>(API_ENDPOINTS.REPORTS_GET(reportId));
    return response.data;
  },
  download: async (reportId: string) => {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.REPORTS_DOWNLOAD(reportId), {
      responseType: 'blob',
    });
    return response.data;
  },
};
