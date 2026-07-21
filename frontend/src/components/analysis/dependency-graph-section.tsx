import { MermaidDiagram } from '@/components/architecture';
import { buildModuleMapDiagram } from '@/lib/dependency-graph';

interface DependencyGraphSectionProps {
  projectName: string;
  modules: string[];
  entities: string[];
}

/**
 * A module/entity structural map, not a true dependency graph - there's no
 * tracked "depends on" relationship between modules in the data model, only
 * flat lists of module and entity names, so the diagram is captioned
 * accordingly rather than implying precision it doesn't have.
 */
export function DependencyGraphSection({ projectName, modules, entities }: DependencyGraphSectionProps) {
  if (modules.length === 0 && entities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Run business analysis to see a module/entity map for this project.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Structural map of detected business modules and core entities - not a precise call-dependency graph, since
        that isn&apos;t tracked by the analysis.
      </p>
      <MermaidDiagram diagram={buildModuleMapDiagram(projectName, modules, entities)} />
    </div>
  );
}
