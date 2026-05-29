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
import { chartColors } from '@/styles/tokens';

interface RadarChartProps {
  series: RadarChartSeries[];
  height?: number;
}

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
            stroke={s.color ?? chartColors[i % chartColors.length]}
            fill={s.color ?? chartColors[i % chartColors.length]}
            fillOpacity={0.2}
          />
        ))}
        <Tooltip />
        {series.length > 1 && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
