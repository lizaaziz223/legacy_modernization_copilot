'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TechnologyDistributionChartProps {
  data: { name: string; value: number }[];
}

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

// Fixed categorical order - never reassigned when the underlying set changes.
const CATEGORICAL_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
];

/**
 * How many projects use each detected technology. Each bar is directly
 * labeled on the axis, so color here is decorative variety rather than the
 * sole identity carrier.
 */
export function TechnologyDistributionChart({ data }: TechnologyDistributionChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No technologies detected yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 34)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => [`${value} project(s)`, 'Usage']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {sorted.map((entry, index) => (
            <Cell key={entry.name} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
