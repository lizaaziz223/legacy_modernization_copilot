'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SecuritySeverityChartProps {
  data: { name: string; value: number }[];
}

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

const SEVERITY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'hsl(var(--status-good))',
  MEDIUM: 'hsl(var(--status-warning))',
  HIGH: 'hsl(var(--status-serious))',
  CRITICAL: 'hsl(var(--status-critical))',
};

/**
 * Security findings across every project, grouped by severity - the
 * canonical use of the reserved status palette, since severity IS a status.
 */
export function SecuritySeverityChart({ data }: SecuritySeverityChartProps) {
  const ordered = SEVERITY_ORDER.map((name) => data.find((entry) => entry.name === name)).filter(
    (entry): entry is { name: string; value: number } => entry !== undefined
  );

  if (ordered.length === 0) {
    return <p className="text-sm text-muted-foreground">No security findings recorded yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={ordered} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
        <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => [`${value} finding(s)`, 'Count']}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {ordered.map((entry) => (
            <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
