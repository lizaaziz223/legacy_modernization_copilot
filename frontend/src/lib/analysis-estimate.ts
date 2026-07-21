/**
 * Rough heuristic for how long running the full analysis pipeline
 * (technology detection through the modernization plan) might take, based on
 * project size. This is a UI-facing estimate only, not a measured value -
 * there's no backend endpoint that reports actual analysis duration.
 */
const BASE_SECONDS = 20;
const PER_FILE_SECONDS = 0.15;
const PER_MB_SECONDS = 0.5;

export function estimateAnalysisSeconds(totalFiles: number, totalSizeBytes: number): number {
  const sizeMb = totalSizeBytes / (1024 * 1024);
  return Math.round(BASE_SECONDS + totalFiles * PER_FILE_SECONDS + sizeMb * PER_MB_SECONDS);
}
