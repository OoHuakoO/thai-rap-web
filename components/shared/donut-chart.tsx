'use client'

import { PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { colors } from '@/styles/tokens'

interface DonutSlice {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutSlice[]
  centerLabel?: string
  centerValue?: string | number
  height?: number
  showLegend?: boolean
}

const DEFAULT_COLORS = [
  colors.orange,
  colors.orangeLight,
  colors.charcoal,
  colors.scoreGreen,
  colors.scoreRed,
  '#3B82F6',
  '#F59E0B',
]

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 260,
  showLegend = true,
}: DonutChartProps) {
  const chartConfig = data.reduce<ChartConfig>((acc, slice, i) => {
    acc[slice.label] = {
      label: slice.label,
      color: slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }
    return acc
  }, {})

  return (
    <ChartContainer config={chartConfig} className="mx-auto" style={{ height }}>
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
          {(centerLabel || centerValue !== undefined) && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              {centerValue !== undefined && (
                <tspan x="50%" dy="-0.4em" fontSize={22} fontWeight={700} fill={colors.charcoal}>
                  {centerValue}
                </tspan>
              )}
              {centerLabel && (
                <tspan x="50%" dy={centerValue !== undefined ? '1.4em' : '0.35em'} fontSize={11} fill={colors.charcoal}>
                  {centerLabel}
                </tspan>
              )}
            </text>
          )}
        </Pie>
        {showLegend && <ChartLegend content={<ChartLegendContent nameKey="label" />} />}
      </PieChart>
    </ChartContainer>
  )
}
