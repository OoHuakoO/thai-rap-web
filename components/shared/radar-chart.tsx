'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { RadarChartSeries } from '@/types';

interface RadarChartProps {
  series: RadarChartSeries[];
  height?: number;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function RadarChart({ series, height = 300 }: RadarChartProps) {
  // Merge all series into a single flat array keyed by subject
  const subjects = series[0]?.data.map((d) => d.subject) ?? [];

  const chartData = subjects.map((subject) => {
    const row: Record<string, string | number> = { subject };
    series.forEach((s) => {
      const point = s.data.find((d) => d.subject === subject);
      row[s.key] = point?.value ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        {series.map((s, i) => (
          <Radar
            key={s.key}
            name={s.label}
            dataKey={s.key}
            stroke={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            fill={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            fillOpacity={0.2}
          />
        ))}
        <Tooltip />
        {series.length > 1 && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
