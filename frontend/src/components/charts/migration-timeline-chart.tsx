'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MigrationTimelineChartProps {
  data: { name: string; months: number }[];
}

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

/**
 * Estimated migration duration per project (parsed from the modernization
 * plan's free-text timeline). Single-hue magnitude encoding - project names
 * on the axis already carry identity.
 */
export function MigrationTimelineChart({ data }: MigrationTimelineChartProps) {
  const sorted = [...data].sort((a, b) => b.months - a.months);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No estimated timelines available yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 36)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} unit="mo" />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => [`${value} month(s)`, 'Estimated timeline']}
        />
        <Bar dataKey="months" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
