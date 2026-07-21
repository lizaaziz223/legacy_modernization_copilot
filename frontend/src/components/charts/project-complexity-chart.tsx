'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ProjectComplexityChartProps {
  data: { name: string; value: number }[];
}

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

// Ordinal complexity reads as a risk level, so it borrows the fixed status
// palette (good/warning/critical) rather than categorical hues.
const COMPLEXITY_COLORS: Record<string, string> = {
  LOW: 'hsl(var(--status-good))',
  MEDIUM: 'hsl(var(--status-warning))',
  HIGH: 'hsl(var(--status-critical))',
};

/**
 * How many projects fall into each migration-complexity tier. A single
 * series with the tier already labeled on the axis, so no legend box is
 * needed - only the fixed status color per bar.
 */
export function ProjectComplexityChart({ data }: ProjectComplexityChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No modernization plans generated yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
        <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => [`${value} project(s)`, 'Count']}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COMPLEXITY_COLORS[entry.name] ?? 'hsl(var(--primary))'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
