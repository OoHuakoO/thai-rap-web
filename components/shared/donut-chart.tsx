'use client';

import { PieChart, Pie, Cell, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { colors } from '@/styles/tokens';
import { buildChartConfig } from '@/utils/build-chart-config';

interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  colors.orange,
  colors.orangeLight,
  colors.charcoal,
  colors.scoreGreen,
  colors.scoreRed,
  '#3B82F6',
  '#F59E0B',
];

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 260,
  showLegend = true,
}: DonutChartProps) {
  const chartConfig = buildChartConfig(
    data,
    (slice) => slice.label,
    (slice) => slice.label,
    (slice) => slice.color,
    DEFAULT_COLORS
  );

  return (
    <ChartContainer config={chartConfig} className="mx-auto w-full" style={{ height }}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
        >
          {data.map((slice, i) => (
            <Cell
              key={slice.label}
              fill={slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            />
          ))}
          {/* Recharts renders only the child types it knows, so a bare <text>
              here is dropped — the centre caption has to arrive as a <Label>
              and take its coordinates from the ring's own viewBox. */}
          {(centerLabel || centerValue !== undefined) && (
            <Label
              position="center"
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox)) return null;
                const { cx, cy } = viewBox;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    {centerValue !== undefined && (
                      <tspan
                        x={cx}
                        dy="-0.4em"
                        fontSize={22}
                        fontWeight={700}
                        fill={colors.charcoal}
                      >
                        {centerValue}
                      </tspan>
                    )}
                    {centerLabel && (
                      <tspan
                        x={cx}
                        dy={centerValue !== undefined ? '1.4em' : '0.35em'}
                        fontSize={11}
                        fill={colors.charcoal}
                      >
                        {centerLabel}
                      </tspan>
                    )}
                  </text>
                );
              }}
            />
          )}
        </Pie>
        {showLegend && <ChartLegend content={<ChartLegendContent nameKey="label" />} />}
      </PieChart>
    </ChartContainer>
  );
}
