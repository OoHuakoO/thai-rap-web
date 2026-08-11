'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { colors } from '@/styles/tokens';
import { buildChartConfig } from '@/utils/build-chart-config';

interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

interface BarChartProps {
  data: Record<string, string | number>[];
  series: BarSeries[];
  xKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Shortens the axis tick only — the tooltip keeps the full value from `data`. */
  xTickFormatter?: (value: string) => string;
}

const DEFAULT_COLORS = [colors.orange, colors.charcoal, colors.orangeLight, colors.scoreGreen];
const BAR_CATEGORY_GAP = '12%';
const BAR_GAP = 4;

export function BarChart({
  data,
  series,
  xKey = 'label',
  height = 280,
  showGrid = true,
  showLegend = true,
  xTickFormatter,
}: BarChartProps) {
  const chartConfig = buildChartConfig(
    series,
    (s) => s.key,
    (s) => s.label,
    (s) => s.color,
    DEFAULT_COLORS
  );

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <RechartsBarChart data={data} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: colors.charcoal }}
          tickFormatter={xTickFormatter}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: colors.charcoal }} axisLine={false} tickLine={false} />
        {/* The tooltip is where a truncated axis tick gets read in full, so its
            label wraps instead of stretching the card off-screen. */}
        <ChartTooltip
          content={<ChartTooltipContent className="max-w-64" labelClassName="whitespace-normal" />}
        />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={[3, 3, 0, 0]} />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
