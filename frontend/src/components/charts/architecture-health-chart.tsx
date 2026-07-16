'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ArchitectureHealthChartProps {
  data: { name: string; score: number }[];
}

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

function healthColor(score: number): string {
  if (score >= 75) return 'hsl(var(--status-good))';
  if (score >= 50) return 'hsl(var(--status-warning))';
  if (score >= 25) return 'hsl(var(--status-serious))';
  return 'hsl(var(--status-critical))';
}

/**
 * Architecture score per project on the standard 0-100 "higher is better"
 * scale. Bar color reflects the same status tiers as the top-row metric
 * cards, so a quick scan of the chart matches the scorecard language used
 * elsewhere in the dashboard.
 */
export function ArchitectureHealthChart({ data }: ArchitectureHealthChartProps) {
  const sorted = [...data].sort((a, b) => a.score - b.score);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">Run an architecture analysis to see project health.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 34)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
          formatter={(value: number) => [`${value}/100`, 'Architecture score']}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {sorted.map((entry) => (
            <Cell key={entry.name} fill={healthColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
