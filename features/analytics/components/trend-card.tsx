'use client';

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from 'recharts';
import { AlertCard } from '@/components/shared/alert-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { colors } from '@/styles/tokens';
import { cn } from '@/utils/cn';
import {
  ANALYTICS_CHART_SCALE,
  DEFAULT_CHART_SCALE,
  SCORE_AXIS_DOMAIN,
  SCORE_AXIS_TICKS,
  type AnalyticsChartScale,
} from '../constants/analytics-display.constants';
import { TREND_CARD_TEXT } from '../constants/analytics-text.constants';
import type { TrendData } from '../types/analytics.types';
import { toRoundCode } from '../utils/round-code';
import { splitMeasuredAndProjected } from '../utils/trend-split';

interface TrendCardProps {
  trend: TrendData;
  scale?: AnalyticsChartScale;
}

const MEASURED_KEY = 'measured';
const PROJECTED_KEY = 'projected';
const PROJECTED_LABEL_KEY = 'projectedLabel';

const formatPointLabel = (value: number | string) => Math.round(Number(value)).toString();

export function TrendCard({ trend, scale = DEFAULT_CHART_SCALE }: TrendCardProps) {
  const style = ANALYTICS_CHART_SCALE[scale];
  const series = trend.series[0];
  const hasData = trend.xAxis.length > 0 && Boolean(series);

  const lineColor = series?.color ?? colors.orange;

  const chartConfig: ChartConfig = {
    [MEASURED_KEY]: { label: series?.name ?? TREND_CARD_TEXT.axisLabel, color: lineColor },
    [PROJECTED_KEY]: { label: TREND_CARD_TEXT.projectedLegend, color: lineColor },
  };

  const chartData = hasData ? splitMeasuredAndProjected(trend.xAxis, series) : [];

  // Axis labels carry a qualifier the title doesn't want — "T3 (เป้าหมาย)" in
  // the heading reads as "(T0 – T3 (เป้าหมาย) Trend)".
  const firstLabel = toRoundCode(trend.xAxis[0]);
  const lastLabel = toRoundCode(trend.xAxis[trend.xAxis.length - 1]);

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className={cn('font-semibold text-text-main', style.cardTitle)}>
          {hasData ? TREND_CARD_TEXT.titleWithRange(firstLabel, lastLabel) : TREND_CARD_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {!hasData && <AlertCard variant="info" message={TREND_CARD_TEXT.empty} />}

        {hasData && series && (
          <>
            <ul className="flex flex-wrap items-center gap-4">
              <li className={cn('flex items-center gap-1.5 text-charcoal', style.legend)}>
                <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: lineColor }} />
                {series.name}
              </li>
              <li className={cn('flex items-center gap-1.5 text-charcoal', style.legend)}>
                <span
                  className="h-0 w-4 border-t-2 border-dashed"
                  style={{ borderColor: lineColor }}
                />
                {TREND_CARD_TEXT.projectedLegend}
              </li>
            </ul>

            <ChartContainer
              config={chartConfig}
              className="w-full"
              style={{ height: style.chartHeight }}
            >
              <LineChart
                data={chartData}
                margin={{
                  top: style.chartTopMargin,
                  right: 16,
                  bottom: 0,
                  left: style.chartLeftMargin,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                {/* interval=0 keeps every round labelled — Recharts otherwise
                    drops ticks it thinks would collide. The qualifier is
                    stripped for the same reason: the dashed line and its legend
                    entry already say which points are projected. */}
                <XAxis
                  dataKey="label"
                  tickFormatter={toRoundCode}
                  tick={style.axisTick}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={SCORE_AXIS_DOMAIN}
                  ticks={SCORE_AXIS_TICKS}
                  tick={style.axisTick}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: TREND_CARD_TEXT.axisLabel,
                    position: 'insideTopLeft',
                    offset: style.axisLabelOffset,
                    style: style.axisTick,
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey={MEASURED_KEY}
                  type="linear"
                  stroke={`var(--color-${MEASURED_KEY})`}
                  strokeWidth={2}
                  dot={{ r: 3.5 }}
                  connectNulls={false}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={MEASURED_KEY}
                    position="top"
                    formatter={formatPointLabel}
                    style={style.valueLabel}
                  />
                </Line>
                <Line
                  dataKey={PROJECTED_KEY}
                  type="linear"
                  stroke={`var(--color-${PROJECTED_KEY})`}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3.5 }}
                  connectNulls={false}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={PROJECTED_LABEL_KEY}
                    position="top"
                    formatter={formatPointLabel}
                    style={style.valueLabel}
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
