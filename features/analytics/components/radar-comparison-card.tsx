'use client';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { AlertCard } from '@/components/shared/alert-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/utils/cn';
import {
  AXIS_TICK,
  RADAR_CHART_HEIGHT,
  SCORE_AXIS_DOMAIN,
  SERIES_COLORS,
} from '../constants/analytics-display.constants';
import { RADAR_CARD_TEXT } from '../constants/analytics-text.constants';
import type { RadarChartData } from '../types/analytics.types';
import { toNumberedDimensionLabel } from '../utils/dimension-label';
import { toSeriesKey } from '../utils/series-key';
import { RadarAxisTick } from './radar-axis-tick';

interface RadarComparisonCardProps {
  radar: RadarChartData;
}

const RADAR_FILL_OPACITY = 0.18;

export function RadarComparisonCard({ radar }: RadarComparisonCardProps) {
  const hasData = radar.axes.length > 0 && radar.series.length > 0;

  const chartConfig: ChartConfig = Object.fromEntries(
    radar.series.map((series, index) => [
      toSeriesKey(index),
      { label: series.name, color: series.color ?? SERIES_COLORS[index % SERIES_COLORS.length] },
    ])
  );

  const chartData = radar.axes.map((axis, axisIndex) => ({
    axis: toNumberedDimensionLabel(axis, axisIndex),
    ...Object.fromEntries(
      radar.series.map((series, seriesIndex) => [
        toSeriesKey(seriesIndex),
        series.data[axisIndex] ?? 0,
      ])
    ),
  }));

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold text-text-main">
          {RADAR_CARD_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {!hasData && <AlertCard variant="info" message={RADAR_CARD_TEXT.empty} />}

        {hasData && (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto w-full"
              style={{ height: RADAR_CHART_HEIGHT }}
            >
              {/* Leaves room around the plot for the two-line axis labels —
                  a larger radius clips the long Thai dimension names. */}
              <RadarChart data={chartData} outerRadius="58%">
                <ChartTooltip content={<ChartTooltipContent />} />
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="axis" tick={<RadarAxisTick />} />
                <PolarRadiusAxis
                  domain={SCORE_AXIS_DOMAIN}
                  tick={{ fontSize: 9, fill: AXIS_TICK.fill }}
                  axisLine={false}
                  tickCount={3}
                />
                {radar.series.map((series, index) => {
                  const key = toSeriesKey(index);
                  return (
                    <Radar
                      key={key}
                      name={series.name}
                      dataKey={key}
                      stroke={`var(--color-${key})`}
                      fill={`var(--color-${key})`}
                      fillOpacity={RADAR_FILL_OPACITY}
                      strokeWidth={2}
                      strokeDasharray={series.dashed ? '4 3' : undefined}
                      dot={{ r: 2.5 }}
                    />
                  );
                })}
              </RadarChart>
            </ChartContainer>

            <ul
              aria-label={RADAR_CARD_TEXT.legendAria}
              className="mt-auto flex flex-wrap items-center justify-center gap-4"
            >
              {radar.series.map((series, index) => (
                <li
                  key={series.name}
                  className="flex items-center gap-1.5 text-[11px] text-charcoal"
                >
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full')}
                    style={{
                      backgroundColor: series.color ?? SERIES_COLORS[index % SERIES_COLORS.length],
                    }}
                  />
                  {series.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
