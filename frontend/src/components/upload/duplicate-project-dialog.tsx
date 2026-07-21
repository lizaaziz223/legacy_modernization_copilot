import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui';
import type { Project } from '@/types';
import { formatDateTime } from '@/utils';

interface DuplicateProjectDialogProps {
  open: boolean;
  existingProject: Project | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DuplicateProjectDialog({ open, existingProject, onCancel, onConfirm }: DuplicateProjectDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-status-warning" />
            Possible duplicate project
          </DialogTitle>
          <DialogDescription>
            {existingProject && (
              <>
                A project named &quot;{existingProject.originalFileName}&quot; was already uploaded on{' '}
                {formatDateTime(existingProject.createdAt)}. Upload it again anyway?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Upload Anyway
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
