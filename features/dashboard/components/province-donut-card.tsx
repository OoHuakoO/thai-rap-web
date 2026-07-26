'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { buildChartConfig } from '@/utils/build-chart-config';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { PROVINCE_DONUT_COLORS } from '../constants/dashboard-display.constants';
import { DASHBOARD_SHARED_TEXT, PROVINCE_DONUT_TEXT } from '../constants/dashboard-text.constants';
import { useDashboardKpis } from '../hooks/use-dashboard-kpis';
import { useProvinceDistribution } from '../hooks/use-province-distribution';
import { formatDataDate } from '../utils/format-data-date';

const CHART_HEIGHT = 170;
const INNER_RADIUS = 48;
const OUTER_RADIUS = 74;

export function ProvinceDonutCard() {
  const { data: items, isLoading, isError, error } = useProvinceDistribution();
  const { data: kpis } = useDashboardKpis();

  const chartConfig = buildChartConfig(
    items ?? [],
    (item) => item.province,
    (item) => item.province,
    (item) => item.color,
    PROVINCE_DONUT_COLORS
  );

  const total = (items ?? []).reduce((sum, item) => sum + item.count, 0);
  const dataDate = formatDataDate(kpis?.lastUpdated);

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">
          {PROVINCE_DONUT_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pb-3">
        {isLoading && <CardSkeleton />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && !items?.length && (
          <AlertCard variant="info" message={PROVINCE_DONUT_TEXT.empty} />
        )}

        {!isLoading && !isError && !!items?.length && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 2xl:flex-row">
            <div
              className="relative w-full max-w-[240px] shrink-0"
              style={{ height: CHART_HEIGHT }}
            >
              <ChartContainer
                config={chartConfig}
                className="h-full w-full"
                style={{ height: CHART_HEIGHT }}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={items}
                    dataKey="count"
                    nameKey="province"
                    cx="50%"
                    cy="50%"
                    innerRadius={INNER_RADIUS}
                    outerRadius={OUTER_RADIUS}
                    paddingAngle={1}
                    strokeWidth={0}
                    // Recharts sizes percentage radii from its first measured
                    // box; on a cold mount that box is still 0 and the sectors
                    // animate in at zero radius, so the ring never appears.
                    isAnimationActive={false}
                  >
                    {items.map((item, index) => (
                      <Cell
                        key={item.province}
                        fill={
                          item.color ?? PROVINCE_DONUT_COLORS[index % PROVINCE_DONUT_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums text-text-main">
                  {total.toLocaleString('th-TH')}
                </span>
                <span className="text-xs text-charcoal">{PROVINCE_DONUT_TEXT.centerUnit}</span>
              </div>
            </div>

            <ul className="w-full min-w-0 flex-1 space-y-2">
              {items.map((item, index) => (
                <li
                  key={item.province}
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        item.color ?? PROVINCE_DONUT_COLORS[index % PROVINCE_DONUT_COLORS.length],
                    }}
                  />
                  <span className="text-charcoal">{item.province}</span>
                  <span className="font-medium tabular-nums text-text-main">
                    {PROVINCE_DONUT_TEXT.legendEntry(item.count, item.percentage)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {dataDate && (
          <p className="mt-auto text-right text-[11px] text-charcoal">
            {DASHBOARD_SHARED_TEXT.dataAsOf(dataDate)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
