/**
 * Custom Hooks for the Application
 */

export { useDashboardAnalytics, type DashboardAnalytics } from './use-dashboard-analytics';
export { useProjectFullAnalysis, type ProjectFullAnalysis } from './use-project-full-analysis';

import { useState, useEffect, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ScanSearch, BookOpen, Network, ShieldAlert, Gauge, Map, Code2 } from 'lucide-react';
import {
  technologyDetectionService,
  businessAnalysisStatusService,
  architectureAnalysisService,
  securityAnalysisStatusService,
  performanceAnalysisStatusService,
  modernizationPlanService,
  springBootGenerationStatusService,
} from '@/services';

export interface AnalysisStage {
  key: string;
  label: string;
  icon: LucideIcon;
  completedAt: string | null;
}

function resultDate(result: PromiseSettledResult<{ createdAt: string }>): string | null {
  return result.status === 'fulfilled' ? result.value.createdAt : null;
}

/**
 * useProjectAnalysisStages Hook
 * Fetches the completion status of every analysis stage for a project
 * (technology detection through Spring Boot generation), tolerating stages
 * that haven't been run yet (their GET requests 404, which is expected).
 */
export function useProjectAnalysisStages(projectId: string): AnalysisStage[] | null {
  const [stages, setStages] = useState<AnalysisStage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStages(null);

    Promise.allSettled([
      technologyDetectionService.get(projectId),
      businessAnalysisStatusService.get(projectId),
      architectureAnalysisService.get(projectId),
      securityAnalysisStatusService.get(projectId),
      performanceAnalysisStatusService.get(projectId),
      modernizationPlanService.get(projectId),
      springBootGenerationStatusService.get(projectId),
    ]).then(([technology, business, architecture, security, performance, plan, springBoot]) => {
      if (cancelled) return;
      setStages([
        { key: 'technology', label: 'Technology Detection', icon: ScanSearch, completedAt: resultDate(technology) },
        { key: 'business', label: 'Business Analysis', icon: BookOpen, completedAt: resultDate(business) },
        { key: 'architecture', label: 'Architecture Analysis', icon: Network, completedAt: resultDate(architecture) },
        { key: 'security', label: 'Security Analysis', icon: ShieldAlert, completedAt: resultDate(security) },
        { key: 'performance', label: 'Performance Analysis', icon: Gauge, completedAt: resultDate(performance) },
        { key: 'plan', label: 'Modernization Plan', icon: Map, completedAt: resultDate(plan) },
        { key: 'springboot', label: 'Spring Boot Sample', icon: Code2, completedAt: resultDate(springBoot) },
      ]);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return stages;
}

/**
 * useAsync Hook
 * Manages loading, error, and data states for async operations
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
}

/**
 * useLocalStorage Hook
 * Persist state to localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * useDebounce Hook
 * Debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * usePrevious Hook
 * Track the previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T>();

  useEffect(() => {
    setPrevious(value);
  }, [value]);

  return previous;
}
