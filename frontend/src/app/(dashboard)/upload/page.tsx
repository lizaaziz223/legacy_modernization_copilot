'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { CheckCircle2 } from 'lucide-react';
import {
  ProjectDropzone,
  UploadProgressBar,
  ProjectSummaryCard,
  DuplicateProjectDialog,
} from '@/components/upload';
import { projectService, technologyDetectionService } from '@/services';
import { Project, TechnologyDetectionResult } from '@/types';
import { isLikelyZipFile, findDuplicateProject } from '@/lib/upload-validation';

type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [technology, setTechnology] = useState<TechnologyDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [duplicateMatch, setDuplicateMatch] = useState<Project | null>(null);

  const uploadStartedAt = useRef<number>(0);

  useEffect(() => {
    projectService
      .list()
      .then(setExistingProjects)
      .catch(() => setExistingProjects([]));
  }, []);

  const runUpload = async (file: File) => {
    setError(null);
    setProject(null);
    setTechnology(null);
    setFileName(file.name);
    setProgress(0);
    setEtaSeconds(null);
    setState('uploading');
    uploadStartedAt.current = Date.now();

    try {
      const uploaded = await projectService.upload(file, (progressEvent) => {
        if (!progressEvent.total) return;
        const loaded = progressEvent.loaded;
        const total = progressEvent.total;
        setProgress(Math.round((loaded / total) * 100));

        const elapsedSeconds = (Date.now() - uploadStartedAt.current) / 1000;
        if (elapsedSeconds > 0.5 && loaded > 0) {
          const bytesPerSecond = loaded / elapsedSeconds;
          setEtaSeconds((total - loaded) / bytesPerSecond);
        }
      });

      setProject(uploaded);
      setState('success');
      setExistingProjects((prev) => [uploaded, ...prev]);

      setIsDetecting(true);
      technologyDetectionService
        .run(uploaded.id)
        .then(setTechnology)
        .catch(() => setTechnology(null))
        .finally(() => setIsDetecting(false));
    } catch (uploadError: unknown) {
      const message = isAxiosError<{ message?: string }>(uploadError)
        ? uploadError.response?.data?.message
        : undefined;
      setError(message ?? 'Failed to upload project');
      setState('error');
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only ZIP archives are supported');
      setState('error');
      return;
    }

    setError(null);
    setState('validating');

    const looksLikeZip = await isLikelyZipFile(file);
    if (!looksLikeZip) {
      setError('This file does not look like a valid ZIP archive');
      setState('error');
      return;
    }

    const duplicate = findDuplicateProject(existingProjects, file);
    if (duplicate) {
      setState('idle');
      setPendingFile(file);
      setDuplicateMatch(duplicate);
      return;
    }

    await runUpload(file);
  };

  const handleConfirmDuplicateUpload = async () => {
    const file = pendingFile;
    setDuplicateMatch(null);
    setPendingFile(null);
    if (file) await runUpload(file);
  };

  const handleCancelDuplicateUpload = () => {
    setDuplicateMatch(null);
    setPendingFile(null);
    setState('idle');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a ZIP archive of your legacy project for analysis
        </p>
      </div>

      {state !== 'success' && (
        <div className="max-w-xl">
          <ProjectDropzone
            onFileSelected={handleFileSelected}
            disabled={state === 'uploading' || state === 'validating'}
            error={error}
          />
          {state === 'validating' && (
            <p className="mt-2 text-sm text-muted-foreground">Validating archive...</p>
          )}
        </div>
      )}

      {state === 'uploading' && (
        <div className="max-w-xl">
          <UploadProgressBar progress={progress} fileName={fileName} etaSeconds={etaSeconds} />
        </div>
      )}

      {state === 'success' && project && (
        <div className="max-w-2xl animate-pop-in">
          <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Upload complete</h2>
          </div>
          <ProjectSummaryCard project={project} technology={technology} isDetecting={isDetecting} />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline hover:opacity-90"
            >
              View project &amp; run full analysis
            </Link>
            <button
              type="button"
              onClick={() => {
                setState('idle');
                setProject(null);
                setTechnology(null);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Upload another project
            </button>
          </div>
        </div>
      )}

      <DuplicateProjectDialog
        open={duplicateMatch !== null}
        existingProject={duplicateMatch}
        onCancel={handleCancelDuplicateUpload}
        onConfirm={handleConfirmDuplicateUpload}
      />
    </div>
  );
}
