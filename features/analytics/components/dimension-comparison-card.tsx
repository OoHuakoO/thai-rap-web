'use client';

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { AlertCard } from '@/components/shared/alert-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AXIS_TICK,
  BAR_CHART_HEIGHT,
  BAR_VALUE_LABEL_STYLE,
  SCORE_AXIS_DOMAIN,
  SCORE_AXIS_TICKS,
  SERIES_COLORS,
  toDimensionNumber,
  type ComparePairOption,
} from '../constants/analytics-display.constants';
import { DIMENSION_COMPARISON_TEXT } from '../constants/analytics-text.constants';
import type { RadarChartData } from '../types/analytics.types';
import { toNumberedDimensionLabel } from '../utils/dimension-label';
import { toSeriesKey } from '../utils/series-key';

interface DimensionComparisonCardProps {
  /** Same payload as the radar — one chart per reading of the same 8 values. */
  radar: RadarChartData;
  comparePair: ComparePairOption;
}

const BAR_CATEGORY_GAP = '18%';
const BAR_GAP = 3;
const LABEL_OFFSET = 6;

const formatBarLabel = (value: number | string) => Math.round(Number(value)).toString();

export function DimensionComparisonCard({ radar, comparePair }: DimensionComparisonCardProps) {
  const hasData = radar.axes.length > 0 && radar.series.length > 0;

  const chartConfig: ChartConfig = Object.fromEntries(
    radar.series.map((series, index) => [
      toSeriesKey(index),
      { label: series.name, color: series.color ?? SERIES_COLORS[index % SERIES_COLORS.length] },
    ])
  );

  const chartData = radar.axes.map((axis, axisIndex) => ({
    dimension: toDimensionNumber(axisIndex),
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
          {DIMENSION_COMPARISON_TEXT.title(comparePair.from, comparePair.to)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {!hasData && <AlertCard variant="info" message={DIMENSION_COMPARISON_TEXT.empty} />}

        {hasData && (
          <>
            <ul className="flex flex-wrap items-center gap-4">
              {radar.series.map((series, index) => (
                <li
                  key={series.name}
                  className="flex items-center gap-1.5 text-[11px] text-charcoal"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      backgroundColor: series.color ?? SERIES_COLORS[index % SERIES_COLORS.length],
                    }}
                  />
                  {series.name}
                </li>
              ))}
            </ul>

            <ChartContainer
              config={chartConfig}
              className="w-full"
              style={{ height: BAR_CHART_HEIGHT }}
            >
              <BarChart
                data={chartData}
                barCategoryGap={BAR_CATEGORY_GAP}
                barGap={BAR_GAP}
                margin={{ top: 18, right: 5, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="dimension" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  domain={SCORE_AXIS_DOMAIN}
                  ticks={SCORE_AXIS_TICKS}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: DIMENSION_COMPARISON_TEXT.axisLabel,
                    position: 'insideTopLeft',
                    offset: -12,
                    style: AXIS_TICK,
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {radar.series.map((series, index) => {
                  const key = toSeriesKey(index);
                  return (
                    <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[3, 3, 0, 0]}>
                      <LabelList
                        dataKey={key}
                        position="top"
                        offset={LABEL_OFFSET}
                        formatter={formatBarLabel}
                        style={BAR_VALUE_LABEL_STYLE}
                      />
                    </Bar>
                  );
                })}
              </BarChart>
            </ChartContainer>

            {/* Eight Thai dimension names never fit as X-axis ticks, so the axis
                carries the number and the legend below carries the name. */}
            <ol className="mt-auto grid grid-cols-1 gap-x-4 gap-y-0.5 rounded-lg bg-muted/40 p-2.5 text-[10.5px] leading-snug text-charcoal sm:grid-cols-2">
              {radar.axes.map((axis, index) => (
                <li key={axis}>{toNumberedDimensionLabel(axis, index)}</li>
              ))}
            </ol>
          </>
        )}
      </CardContent>
    </Card>
  );
}
