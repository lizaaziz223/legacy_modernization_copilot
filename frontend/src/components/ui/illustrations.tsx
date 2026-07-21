import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FolderOpen, Upload, ScanSearch, Network, ShieldCheck, Gauge, FileText, Sparkles, Download } from 'lucide-react';
import { cn } from '@/utils';

/**
 * Small, composed "illustrations" for empty states - built from the same
 * bordered-tile + icon language used elsewhere in the app (e.g. the landing
 * page hero pipeline) rather than imported raster/vector art, so they stay
 * theme-aware and dependency-free.
 */

function IllustrationPanel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-grid-pattern relative flex h-32 w-44 items-center justify-center rounded-2xl bg-muted/40">
      {children}
    </div>
  );
}

function CenterTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl shadow-sm', className)}>
      <Icon className="h-6 w-6" />
    </div>
  );
}

function FloatingTile({
  icon: Icon,
  className,
  delayMs = 0,
}: {
  icon: LucideIcon;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={cn(
        'animate-float absolute flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card shadow-sm',
        className
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

export function EmptyProjectsIllustration() {
  return (
    <IllustrationPanel>
      <CenterTile icon={FolderOpen} className="bg-chart-1/10 text-chart-1" />
      <FloatingTile icon={Upload} className="right-5 top-4 bg-primary text-primary-foreground" />
    </IllustrationPanel>
  );
}

export function EmptyAnalysisIllustration() {
  return (
    <IllustrationPanel>
      <CenterTile icon={ScanSearch} className="bg-secondary/10 text-secondary" />
      <FloatingTile icon={Network} className="left-6 top-4 text-chart-5" delayMs={0} />
      <FloatingTile icon={ShieldCheck} className="right-6 top-4 text-status-good" delayMs={500} />
      <FloatingTile icon={Gauge} className="bottom-4 right-10 text-status-warning" delayMs={1000} />
    </IllustrationPanel>
  );
}

export function EmptyReportIllustration() {
  return (
    <IllustrationPanel>
      <CenterTile icon={FileText} className="bg-chart-2/10 text-chart-2" />
      <FloatingTile icon={Sparkles} className="right-6 top-4 text-chart-5" delayMs={0} />
      <FloatingTile icon={Download} className="bottom-4 left-8 text-status-good" delayMs={700} />
    </IllustrationPanel>
  );
}
