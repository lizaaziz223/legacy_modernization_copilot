import { Check, X } from 'lucide-react';
import { Progress } from '@/components/ui';
import { computeCloudReadiness } from '@/lib/executive-summary';
import type { ModernizationPlan, ModernTechnology } from '@/types';

const CLOUD_TECHNOLOGIES: ModernTechnology[] = ['DOCKER', 'KUBERNETES', 'CLOUD_MIGRATION'];

const TECHNOLOGY_LABELS: Record<ModernTechnology, string> = {
  SPRING_BOOT: 'Spring Boot',
  SPRING_SECURITY: 'Spring Security',
  DOCKER: 'Docker',
  KUBERNETES: 'Kubernetes',
  KAFKA: 'Kafka',
  REDIS: 'Redis',
  OPENAPI: 'OpenAPI',
  CLOUD_MIGRATION: 'Cloud Migration',
};

interface CloudRecommendationPanelProps {
  plan: ModernizationPlan | null;
}

export function CloudRecommendationPanel({ plan }: CloudRecommendationPanelProps) {
  const cloudTechs = plan?.requiredTechnologies.filter((tech) => CLOUD_TECHNOLOGIES.includes(tech.technology)) ?? [];
  const readiness = computeCloudReadiness(plan);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Cloud Readiness</span>
          <span className="text-muted-foreground">{readiness !== null ? `${readiness}%` : '—'}</span>
        </div>
        <Progress value={readiness ?? 0} className="mt-2" />
      </div>

      {cloudTechs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No cloud-specific recommendations were generated for this project yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cloudTechs.map((tech) => (
            <div key={tech.technology} className="flex gap-3 rounded-md border border-border p-3">
              {tech.recommended ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">{TECHNOLOGY_LABELS[tech.technology]}</p>
                <p className="text-xs text-muted-foreground">{tech.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
