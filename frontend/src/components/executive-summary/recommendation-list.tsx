import { Lightbulb } from 'lucide-react';

interface RecommendationListProps {
  recommendations: string[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return <p className="text-sm text-muted-foreground">No recommendations available from the analyses run so far.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {recommendations.map((recommendation, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-good/10 text-status-good">
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm text-foreground">{recommendation}</p>
        </li>
      ))}
    </ol>
  );
}
