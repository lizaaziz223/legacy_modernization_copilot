'use client';

import { useEffect, useState } from 'react';
import {
  projectService,
  businessAnalysisStatusService,
  technologyDetectionService,
  architectureAnalysisService,
  securityAnalysisStatusService,
  performanceAnalysisStatusService,
  modernizationPlanService,
} from '@/services';
import type {
  Project,
  BusinessAnalysisResult,
  TechnologyDetectionResult,
  ArchitectureAnalysisResult,
  SecurityAnalysisSummary,
  PerformanceAnalysisSummary,
  ModernizationPlan,
} from '@/types';

export type FullAnalysisLoadState = 'loading' | 'loaded' | 'error';

export interface ProjectFullAnalysis {
  state: FullAnalysisLoadState;
  project: Project | null;
  business: BusinessAnalysisResult | null;
  technology: TechnologyDetectionResult | null;
  architecture: ArchitectureAnalysisResult | null;
  security: SecurityAnalysisSummary | null;
  performance: PerformanceAnalysisSummary | null;
  plan: ModernizationPlan | null;
}

async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

/**
 * Fetches a single project plus every analysis stage that's been run for it
 * (tolerating stages that haven't run yet - their GET requests 404, which is
 * expected). Shared by the Executive Summary and Analysis pages, which both
 * need the same full picture of a project's analyses.
 */
export function useProjectFullAnalysis(projectId: string): ProjectFullAnalysis {
  const [state, setState] = useState<FullAnalysisLoadState>('loading');
  const [project, setProject] = useState<Project | null>(null);
  const [business, setBusiness] = useState<BusinessAnalysisResult | null>(null);
  const [technology, setTechnology] = useState<TechnologyDetectionResult | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureAnalysisResult | null>(null);
  const [security, setSecurity] = useState<SecurityAnalysisSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalysisSummary | null>(null);
  const [plan, setPlan] = useState<ModernizationPlan | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setState('loading');

    projectService
      .get(projectId)
      .then(async (loadedProject) => {
        const [businessResult, technologyResult, architectureResult, securityResult, performanceResult, planResult] =
          await Promise.all([
            settle(businessAnalysisStatusService.get(projectId)),
            settle(technologyDetectionService.get(projectId)),
            settle(architectureAnalysisService.get(projectId)),
            settle(securityAnalysisStatusService.get(projectId)),
            settle(performanceAnalysisStatusService.get(projectId)),
            settle(modernizationPlanService.get(projectId)),
          ]);

        if (cancelled) return;
        setProject(loadedProject);
        setBusiness(businessResult);
        setTechnology(technologyResult);
        setArchitecture(architectureResult);
        setSecurity(securityResult);
        setPerformance(performanceResult);
        setPlan(planResult);
        setState('loaded');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return { state, project, business, technology, architecture, security, performance, plan };
}
