import { Code } from 'lucide-react';
import type { TechnologyType } from '@/types';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const LEGACY_TECHNOLOGY_LABELS: Record<TechnologyType, string> = {
  SERVLET: 'Servlet',
  JSP: 'JSP',
  SPRING_MVC: 'Spring MVC',
  SPRING_XML: 'Spring XML Config',
  JDBC: 'JDBC',
  HIBERNATE: 'Hibernate',
  EJB: 'EJB',
  COBOL: 'COBOL',
  JCL: 'JCL',
  STRUTS: 'Struts',
};

const LEGACY_TECHNOLOGIES = Object.keys(LEGACY_TECHNOLOGY_LABELS) as TechnologyType[];

export function LegacyTechSection() {
  return (
    <section className="border-b border-border">
      <div className="container py-20">
        <SectionHeading
          eyebrow="Supported Legacy Technologies"
          title="We know legacy Java, inside and out"
          description="From Struts and EJB to mainframe COBOL and JCL - detection is built around real enterprise legacy stacks, not just modern frameworks."
        />

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {LEGACY_TECHNOLOGIES.map((technology, index) => (
            <Reveal key={technology} delayMs={index * 30}>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm">
                <Code className="h-3.5 w-3.5 text-muted-foreground" />
                {LEGACY_TECHNOLOGY_LABELS[technology]}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
