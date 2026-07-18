import { Wrench, ShieldCheck, Gauge, DollarSign, Rocket, Users, type LucideIcon } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: 'status-good' | 'status-warning' | 'status-serious' | 'status-critical' | 'chart-1' | 'chart-5';
}

const BENEFIT_ACCENT_CLASSES: Record<Benefit['accent'], string> = {
  'status-good': 'bg-status-good/10 text-status-good',
  'status-warning': 'bg-status-warning/10 text-status-warning',
  'status-serious': 'bg-status-serious/10 text-status-serious',
  'status-critical': 'bg-status-critical/10 text-status-critical',
  'chart-1': 'bg-chart-1/10 text-chart-1',
  'chart-5': 'bg-chart-5/10 text-chart-5',
};

const BENEFITS: Benefit[] = [
  {
    icon: Wrench,
    title: 'Reduce Technical Debt',
    description: 'Eliminate accumulated shortcuts and outdated patterns before they become production incidents.',
    accent: 'chart-1',
  },
  {
    icon: ShieldCheck,
    title: 'Strengthen Security Posture',
    description: 'Replace deprecated, vulnerable dependencies and insecure patterns with modern, hardened alternatives.',
    accent: 'status-good',
  },
  {
    icon: Gauge,
    title: 'Improve Performance & Scale',
    description: 'Move from monoliths and blocking I/O to architectures built to scale horizontally.',
    accent: 'status-warning',
  },
  {
    icon: DollarSign,
    title: 'Cut Infrastructure Costs',
    description: 'Right-size cloud infrastructure and retire expensive legacy application servers and licenses.',
    accent: 'chart-5',
  },
  {
    icon: Rocket,
    title: 'Accelerate Delivery',
    description: 'Ship features faster with a modern, testable, well-documented Spring Boot foundation.',
    accent: 'status-serious',
  },
  {
    icon: Users,
    title: 'Attract & Retain Talent',
    description: 'Give engineers modern tools to work with instead of asking them to maintain COBOL and JSP.',
    accent: 'status-critical',
  },
];

export function WhyModernizeSection() {
  return (
    <section id="why-modernize" className="scroll-mt-20 border-b border-border bg-muted/30">
      <div className="container py-20">
        <SectionHeading
          eyebrow="Why Modernize"
          title="Legacy systems are a growing liability"
          description="Every release gets slower and riskier the longer modernization waits. Here's what's at stake."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.title} delayMs={index * 60}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${BENEFIT_ACCENT_CLASSES[benefit.accent]}`}>
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
