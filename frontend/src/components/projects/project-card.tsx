'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { FolderKanban, Files, HardDrive, Pencil, Trash2, Download } from 'lucide-react';
import { Project } from '@/types';
import { formatBytes, formatDateTime, triggerBlobDownload } from '@/utils';
import { projectService } from '@/services';
import { useToast } from '@/context/toast-context';
import { Loader } from '@/components/common/loader/loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';

interface ProjectCardProps {
  project: Project;
  onRenamed: (updated: Project) => void;
  onDeleteRequested: (projectId: string) => void;
}

export function ProjectCard({ project, onRenamed, onDeleteRequested }: ProjectCardProps) {
  const toast = useToast();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const openRenameDialog = () => {
    setNameDraft(project.name);
    setRenameError(null);
    setIsRenameOpen(true);
  };

  const handleRenameSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setRenameError('Project name cannot be empty');
      return;
    }

    setIsRenaming(true);
    setRenameError(null);
    try {
      const updated = await projectService.rename(project.id, trimmed);
      onRenamed(updated);
      toast.showSuccess('Project renamed');
      setIsRenameOpen(false);
    } catch {
      setRenameError('Failed to rename project. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await projectService.downloadZip(project.id);
      triggerBlobDownload(blob, `${project.name}.zip`);
    } catch {
      toast.showSuccess('Failed to download the original archive');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirmed = () => {
    setIsDeleteOpen(false);
    onDeleteRequested(project.id);
  };

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={openRenameDialog}
          aria-label="Rename project"
          title="Rename"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download original archive"
          title="Download original ZIP"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {isDownloading ? <Loader size={14} /> : <Download className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          aria-label="Delete project"
          title="Delete"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Link href={`/projects/${project.id}`} className="flex flex-col gap-3 no-underline">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 pr-16">
            <p className="truncate font-medium text-foreground group-hover:underline">{project.name}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(project.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Files className="h-3.5 w-3.5" />
            {project.totalFiles} files
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5" />
            {formatBytes(project.totalSizeBytes)}
          </span>
        </div>
      </Link>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>Choose a new display name for this project.</DialogDescription>
            </DialogHeader>
            <input
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              autoFocus
              maxLength={200}
              className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {renameError && <p className="mt-2 text-sm text-destructive">{renameError}</p>}
            <DialogFooter className="mt-4">
              <button
                type="button"
                onClick={() => setIsRenameOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRenaming}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isRenaming && <Loader size={14} />}
                Save
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{project.name}&quot;?</DialogTitle>
            <DialogDescription>
              This permanently removes the project, its uploaded archive, extracted files, and every analysis,
              report, and migration plan generated for it. You&apos;ll have a few seconds to undo before it&apos;s
              gone for good.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirmed}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
