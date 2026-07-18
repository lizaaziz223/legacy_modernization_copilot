import { Coffee, ShieldCheck, Container, Boxes, Waypoints, Database, FileJson, Cloud, type LucideIcon } from 'lucide-react';
import type { ModernTechnology } from '@/types';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const MODERN_TECHNOLOGIES: { technology: ModernTechnology; label: string; icon: LucideIcon }[] = [
  { technology: 'SPRING_BOOT', label: 'Spring Boot', icon: Coffee },
  { technology: 'SPRING_SECURITY', label: 'Spring Security', icon: ShieldCheck },
  { technology: 'DOCKER', label: 'Docker', icon: Container },
  { technology: 'KUBERNETES', label: 'Kubernetes', icon: Boxes },
  { technology: 'KAFKA', label: 'Kafka', icon: Waypoints },
  { technology: 'REDIS', label: 'Redis', icon: Database },
  { technology: 'OPENAPI', label: 'OpenAPI', icon: FileJson },
  { technology: 'CLOUD_MIGRATION', label: 'Cloud Migration', icon: Cloud },
];

export function TechStackSection() {
  return (
    <section id="technology" className="scroll-mt-20 border-b border-border bg-muted/30">
      <div className="container py-20">
        <SectionHeading
          eyebrow="Technology Stack"
          title="Modern targets, recommended for you"
          description="Every recommendation maps to a real, production-grade technology - never generic advice."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MODERN_TECHNOLOGIES.map((tech, index) => (
            <Reveal key={tech.technology} delayMs={index * 40}>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <tech.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{tech.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
