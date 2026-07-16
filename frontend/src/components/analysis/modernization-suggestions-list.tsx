import { Lightbulb } from 'lucide-react';

interface ModernizationSuggestionsListProps {
  suggestions: string[];
}

/** Quick-win modernization suggestions from the modernization plan. */
export function ModernizationSuggestionsList({ suggestions }: ModernizationSuggestionsListProps) {
  if (suggestions.length === 0) {
    return <p className="text-sm text-muted-foreground">No quick-win suggestions were identified.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {suggestions.map((suggestion, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-good/10 text-status-good">
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm text-foreground">{suggestion}</p>
        </li>
      ))}
    </ul>
  );
}
