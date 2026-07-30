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
  ANALYTICS_CHART_SCALE,
  DEFAULT_CHART_SCALE,
  SCORE_AXIS_DOMAIN,
  SERIES_COLORS,
  type AnalyticsChartScale,
} from '../constants/analytics-display.constants';
import { RADAR_CARD_TEXT } from '../constants/analytics-text.constants';
import type { RadarChartData } from '../types/analytics.types';
import { toNumberedDimensionLabel } from '../utils/dimension-label';
import { toSeriesKey } from '../utils/series-key';
import { RadarAxisTick } from './radar-axis-tick';

interface RadarComparisonCardProps {
  radar: RadarChartData;
  scale?: AnalyticsChartScale;
}

/** Two rounds read fine as tinted areas; four stacked tints turn the plot into
 *  one muddy blob, so past a pair the fill is only a hint and the stroke carries
 *  the series. */
const RADAR_FILL_OPACITY = 0.18;
const RADAR_FILL_OPACITY_MANY = 0.06;
const RADAR_MANY_SERIES = 2;

/**
 * Eight dimensions put a spoke every 45°, and Recharts draws the 0–100 scale
 * along the one pointing right — straight through the dimension name at the end
 * of it. Halfway to the next spoke clears both names: the labels on that side
 * are anchored outwards from the ring, while the ones at the top and bottom are
 * centred on their spoke and reach across every angle near the vertical.
 */
const RADIUS_AXIS_ANGLE = 22.5;

/**
 * The top of the scale is left unlabelled: its tick sits on the outer ring,
 * which is where the dimension names begin, so at every radius that fits the
 * card the two texts run into each other. The ring is the 100 boundary, and the
 * bar chart beside it carries the exact per-dimension numbers.
 */
const formatRadiusTick = (value: number) =>
  value >= SCORE_AXIS_DOMAIN[1] ? '' : String(Math.round(value));

export function RadarComparisonCard({
  radar,
  scale = DEFAULT_CHART_SCALE,
}: RadarComparisonCardProps) {
  const style = ANALYTICS_CHART_SCALE[scale];
  const hasData = radar.axes.length > 0 && radar.series.length > 0;
  const fillOpacity =
    radar.series.length > RADAR_MANY_SERIES ? RADAR_FILL_OPACITY_MANY : RADAR_FILL_OPACITY;

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
        <CardTitle className={cn('font-semibold text-text-main', style.cardTitle)}>
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
              style={{ height: style.chartHeight }}
            >
              {/* Leaves room around the plot for the two-line axis labels —
                  a larger radius clips the long Thai dimension names. */}
              <RadarChart data={chartData} outerRadius={style.radarOuterRadius}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={
                    <RadarAxisTick
                      fontSize={style.radarAxis.fontSize}
                      lineHeight={style.radarAxis.lineHeight}
                      maxCharsPerLine={style.radarAxis.maxCharsPerLine}
                      maxLines={style.radarAxis.maxLines}
                    />
                  }
                />
                <PolarRadiusAxis
                  angle={RADIUS_AXIS_ANGLE}
                  domain={SCORE_AXIS_DOMAIN}
                  tickCount={3}
                  tickFormatter={formatRadiusTick}
                  tick={{ fontSize: style.radarRadiusFontSize, fill: style.axisTick.fill }}
                  axisLine={false}
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
                      fillOpacity={fillOpacity}
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
                  className={cn('flex items-center gap-1.5 text-charcoal', style.legend)}
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
