'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, ScanSearch, ClipboardList, Download, Loader2 } from 'lucide-react';
import { modernizationReportService } from '@/services';
import { triggerBlobDownload } from '@/utils';
import type { Project } from '@/types';

interface QuickActionsProps {
  mostRecentProject: Project | null;
}

/**
 * Dashboard-level shortcuts. "Analyze" and "Generate Report" route to the
 * most recently uploaded project (where those actions actually live);
 * "Download PDF" fetches that project's report directly. All three are
 * disabled with an explanatory tooltip until at least one project exists.
 */
export function QuickActions({ mostRecentProject }: QuickActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!mostRecentProject) return;
    setIsDownloading(true);
    try {
      const blob = await modernizationReportService.downloadPdf(mostRecentProject.id);
      triggerBlobDownload(blob, `${mostRecentProject.name}-modernization-report.pdf`);
    } catch {
      // Dashboard-level shortcut with no dedicated error surface; the full
      // project page's own "Download PDF Report" action reports errors inline.
    } finally {
      setIsDownloading(false);
    }
  };

  const projectHref = mostRecentProject ? `/projects/${mostRecentProject.id}` : '/upload';

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/upload"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline transition-colors hover:opacity-90"
      >
        <Upload className="h-4 w-4" />
        Upload
      </Link>
      <Link
        href={projectHref}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium no-underline transition-colors hover:bg-muted"
      >
        <ScanSearch className="h-4 w-4" />
        Analyze
      </Link>
      <Link
        href={projectHref}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium no-underline transition-colors hover:bg-muted"
      >
        <ClipboardList className="h-4 w-4" />
        Generate Report
      </Link>
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={!mostRecentProject || isDownloading}
        title={mostRecentProject ? undefined : 'Upload a project first'}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Download PDF
      </button>
    </div>
  );
}
