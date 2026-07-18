import { Upload, Sparkles, Map, Download, type LucideIcon } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: Upload,
    title: 'Upload Your Codebase',
    description: 'Upload a zip of your legacy Java application - no manual setup or configuration required.',
  },
  {
    icon: Sparkles,
    title: 'AI Analyzes Everything',
    description: 'AI agents detect technologies, map architecture, and flag security and performance issues in minutes.',
  },
  {
    icon: Map,
    title: 'Review Your Roadmap',
    description: 'Get a prioritized modernization plan with cost and timeline estimates, a risk matrix, and Spring Boot recommendations.',
  },
  {
    icon: Download,
    title: 'Export & Modernize',
    description: 'Download a professional, branded report and start modernizing with AI-generated Spring Boot starter code.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border">
      <div className="container py-20">
        <SectionHeading
          eyebrow="How It Works"
          title="From legacy codebase to modernization plan in four steps"
          description="No lengthy onboarding, no manual documentation - just upload and let the analysis run."
        />

        <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" aria-hidden="true" />

          {STEPS.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 80}>
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-secondary">STEP {index + 1}</span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
