'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { colors } from '@/styles/tokens'
import { buildChartConfig } from '@/utils/build-chart-config'

interface BarSeries {
  key: string
  label: string
  color?: string
}

interface BarChartProps {
  data: Record<string, string | number>[]
  series: BarSeries[]
  xKey?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

const DEFAULT_COLORS = [colors.orange, colors.charcoal, colors.orangeLight, colors.scoreGreen]

export function BarChart({
  data,
  series,
  xKey = 'label',
  height = 280,
  showGrid = true,
  showLegend = true,
}: BarChartProps) {
  const chartConfig = buildChartConfig(
    series,
    (s) => s.key,
    (s) => s.label,
    (s) => s.color,
    DEFAULT_COLORS
  )

  return (
    <ChartContainer config={chartConfig} style={{ height }}>
      <RechartsBarChart data={data} barCategoryGap="30%" barGap={2}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: colors.charcoal }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: colors.charcoal }} axisLine={false} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={`var(--color-${s.key})`}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}
