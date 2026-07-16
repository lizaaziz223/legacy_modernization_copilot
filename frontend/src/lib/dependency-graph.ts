/**
 * Builds a Mermaid graph of a project's business modules and core entities.
 *
 * There's no backend field tracking real inter-module dependency edges (only
 * a flat list of module names and a flat list of entity names), so this
 * intentionally does NOT claim to show real "depends on" relationships -
 * it's a structural map: project -> modules, project -> entities.
 */
function sanitizeLabel(label: string): string {
  return label.replace(/"/g, "'");
}

function nodeId(prefix: string, index: number): string {
  return `${prefix}${index}`;
}

export function buildModuleMapDiagram(projectName: string, modules: string[], entities: string[]): string {
  const lines: string[] = ['graph TD', `  root["${sanitizeLabel(projectName)}"]`];

  modules.forEach((module, index) => {
    const id = nodeId('m', index);
    lines.push(`  root --> ${id}["${sanitizeLabel(module)}"]`);
  });

  if (entities.length > 0) {
    lines.push('  entities["Core Entities"]', '  root --> entities');
    entities.forEach((entity, index) => {
      const id = nodeId('e', index);
      lines.push(`  entities --> ${id}["${sanitizeLabel(entity)}"]`);
    });
  }

  return lines.join('\n');
}
