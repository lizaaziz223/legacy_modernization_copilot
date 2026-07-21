import { ScanSearch, Network, ShieldAlert, Gauge, Map, Code2, type LucideIcon } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: ScanSearch,
    title: 'Technology Detection',
    description:
      'Automatically identify legacy frameworks, build tools, application servers, and databases across your codebase, with confidence scores backed by evidence.',
  },
  {
    icon: Network,
    title: 'Architecture Analysis',
    description:
      'Visualize your current architecture pattern and get an AI-generated target architecture with a clear migration path.',
  },
  {
    icon: ShieldAlert,
    title: 'Security Analysis',
    description:
      'Surface vulnerabilities and outdated security practices with severity ratings, remediation guidance, and modern alternatives.',
  },
  {
    icon: Gauge,
    title: 'Performance Analysis',
    description:
      'Pinpoint performance bottlenecks and get concrete optimization suggestions mapped to modern equivalents.',
  },
  {
    icon: Map,
    title: 'Modernization Roadmap',
    description:
      'Get a prioritized migration strategy, complexity scoring, quick wins, and a risk-ranked roadmap tailored to your codebase.',
  },
  {
    icon: Code2,
    title: 'Spring Boot Code Generation',
    description:
      'Generate sample Spring Boot entities, repositories, services, and controllers based on your legacy code, ready to jump-start the rewrite.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-border bg-muted/30">
      <div className="container py-20">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to plan a modernization"
          description="One platform covering every dimension of a legacy migration - from what you have today to what you should build next."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delayMs={index * 60}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
