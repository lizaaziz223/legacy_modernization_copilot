import { Check, X } from 'lucide-react';
import type { DetectedAttribute, ModernizationPlan, TechnologyDetectionResult } from '@/types';

interface SpringBootRecommendationPanelProps {
  plan: ModernizationPlan | null;
  technology: TechnologyDetectionResult | null;
}

export function SpringBootRecommendationPanel({ plan, technology }: SpringBootRecommendationPanelProps) {
  const recommendation = plan?.requiredTechnologies.find((tech) => tech.technology === 'SPRING_BOOT');

  return (
    <div className="flex flex-col gap-4">
      {recommendation ? (
        <div className="flex gap-3 rounded-md border border-border p-3">
          {recommendation.recommended ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">{recommendation.recommended ? 'Recommended' : 'Not recommended'}</p>
            <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Generate a modernization roadmap to see a Spring Boot recommendation.
        </p>
      )}

      {technology && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetectedVersionStat label="Java" attribute={technology.javaVersion} />
          <DetectedVersionStat label="Spring" attribute={technology.springVersion} />
          <DetectedVersionStat label="Spring Boot" attribute={technology.springBootVersion} />
        </div>
      )}
    </div>
  );
}

function DetectedVersionStat({ label, attribute }: { label: string; attribute: DetectedAttribute }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{attribute.value || 'Not detected'}</p>
    </div>
  );
}
