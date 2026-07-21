import Link from 'next/link';
import { ArrowRight, FileCode2, Sparkles, Coffee, ShieldCheck, Gauge, Network } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="container relative flex flex-col items-center gap-10 py-20 text-center sm:py-28">
        <div
          className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
          style={{ animationDelay: '0ms' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          AI-powered legacy modernization
        </div>

        <h1
          className="animate-fade-in-up max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ animationDelay: '50ms' }}
        >
          AI Legacy Modernization Copilot
        </h1>

        <p
          className="animate-fade-in-up max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
          style={{ animationDelay: '100ms' }}
        >
          AI-powered platform for analyzing, assessing and modernizing enterprise legacy applications.
        </p>

        <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '150ms' }}>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground no-underline hover:opacity-90"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground no-underline hover:bg-muted"
          >
            See How It Works
          </a>
        </div>

        <div
          className="animate-fade-in-up relative mt-6 flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style={{ animationDelay: '200ms' }}
        >
          <PipelineNode icon={FileCode2} label="Legacy Codebase" accent="chart-6" />
          <PipelineArrow />
          <PipelineNode icon={Sparkles} label="AI Analysis" accent="chart-1" />
          <PipelineArrow />
          <PipelineNode icon={Coffee} label="Modern Spring Boot" accent="chart-2" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-24 hidden justify-between px-8 lg:flex">
          <FloatingBadge icon={Network} label="Architecture" delayMs={0} className="translate-y-4" />
          <FloatingBadge icon={ShieldCheck} label="Security" delayMs={600} />
          <FloatingBadge icon={Gauge} label="Performance" delayMs={1200} className="translate-y-8" />
        </div>
      </div>
    </section>
  );
}

const PIPELINE_NODE_ACCENT_CLASSES = {
  'chart-1': 'bg-chart-1/10 text-chart-1',
  'chart-2': 'bg-chart-2/10 text-chart-2',
  'chart-6': 'bg-chart-6/10 text-chart-6',
} as const;

function PipelineNode({
  icon: Icon,
  label,
  accent,
}: {
  icon: typeof FileCode2;
  label: string;
  accent: keyof typeof PIPELINE_NODE_ACCENT_CLASSES;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${PIPELINE_NODE_ACCENT_CLASSES[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function PipelineArrow() {
  return <ArrowRight className="h-5 w-5 shrink-0 rotate-90 text-muted-foreground sm:rotate-0" />;
}

function FloatingBadge({
  icon: Icon,
  label,
  delayMs,
  className = '',
}: {
  icon: typeof Network;
  label: string;
  delayMs: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-float hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm lg:flex ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <Icon className="h-3.5 w-3.5 text-secondary" />
      {label}
    </div>
  );
}
