'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { colors } from '@/styles/tokens';
import { ROLES } from '@/types/auth.types';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  COMPARISON_ROUND_PAIRS,
  COMPARISON_SERIES_COLORS,
  COMPARISON_Y_AXIS_TICKS,
  DEFAULT_COMPARISON_PAIR,
  formatRoundPairLabel,
} from '../constants/dashboard-display.constants';
import {
  DASHBOARD_SHARED_TEXT,
  PROVINCE_COMPARISON_TEXT,
} from '../constants/dashboard-text.constants';
import { useDashboardKpis } from '../hooks/use-dashboard-kpis';
import { useProvinceComparison } from '../hooks/use-province-comparison';
import { formatDataDate } from '../utils/format-data-date';
import { CardFooterButton } from './card-footer-link';
import { StoreScoresDialog } from './store-scores-dialog';

const CHART_HEIGHT = 260;
const LABEL_OFFSET = 8;
const BAR_CATEGORY_GAP = '12%';
const BAR_GAP = 4;
const AXIS_TICK = { fontSize: 12, fill: colors.charcoal };
const LABEL_STYLE = { fontSize: 9, fontWeight: 600, fill: colors.charcoal };

const formatScoreLabel = (value: number | string) => Number(value).toFixed(2);

export function ProvinceComparisonCard() {
  const [pairValue, setPairValue] = useState(DEFAULT_COMPARISON_PAIR.value);
  const [isScoresOpen, setScoresOpen] = useState(false);
  const pair =
    COMPARISON_ROUND_PAIRS.find((option) => option.value === pairValue)?.pair ??
    DEFAULT_COMPARISON_PAIR.pair;

  const { data: items, isLoading, isError, error } = useProvinceComparison(pair);
  const { data: kpis } = useDashboardKpis();

  // ปิดให้ ENTREPRENEUR — การเทียบคะแนนเฉลี่ยรายจังหวัดเป็นมุมมองภาพรวมของโครงการ
  // ไม่ใช่ข้อมูลร้านตัวเอง เช่นเดียวกับ Top20Card
  const hasRole = useAuthStore((s) => s.hasRole);
  const isHiddenForRole = hasRole(ROLES.ENTREPRENEUR);

  const dataDate = formatDataDate(kpis?.lastUpdated);

  const fromLabel = PROVINCE_COMPARISON_TEXT.seriesLabel(pair.from);
  const toLabel = PROVINCE_COMPARISON_TEXT.seriesLabel(pair.to);

  const chartConfig: ChartConfig = {
    fromScore: { label: fromLabel, color: COMPARISON_SERIES_COLORS.fromScore },
    toScore: { label: toLabel, color: COMPARISON_SERIES_COLORS.toScore },
  };

  const legendItems = [
    { key: 'fromScore', label: fromLabel, className: 'bg-orange' },
    { key: 'toScore', label: toLabel, className: 'bg-purple-banner' },
  ];

  if (isHiddenForRole) return null;

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">
          {PROVINCE_COMPARISON_TEXT.title(pair.from, pair.to)}
        </CardTitle>
        <Select value={pairValue} onValueChange={setPairValue}>
          <SelectTrigger
            className="h-8 w-28 shrink-0 text-xs"
            aria-label={PROVINCE_COMPARISON_TEXT.roundPairLabel}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPARISON_ROUND_PAIRS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {formatRoundPairLabel(option.pair)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {isLoading && <CardSkeleton />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && !items?.length && (
          <AlertCard variant="info" message={PROVINCE_COMPARISON_TEXT.empty} />
        )}

        {!isLoading && !isError && !!items?.length && (
          <>
            <ul className="flex flex-wrap items-center gap-4">
              {legendItems.map((item) => (
                <li key={item.key} className="flex items-center gap-1.5 text-[11px] text-charcoal">
                  <span className={cn('h-2.5 w-2.5 rounded-sm', item.className)} />
                  {item.label}
                </li>
              ))}
            </ul>

            <ChartContainer
              config={chartConfig}
              className="w-full"
              style={{ height: CHART_HEIGHT }}
            >
              <BarChart
                data={items}
                barCategoryGap={BAR_CATEGORY_GAP}
                barGap={BAR_GAP}
                margin={{ top: 20, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="province" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  ticks={COMPARISON_Y_AXIS_TICKS}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="fromScore" fill="var(--color-fromScore)" radius={[3, 3, 0, 0]}>
                  <LabelList
                    dataKey="fromScore"
                    position="top"
                    offset={LABEL_OFFSET}
                    formatter={formatScoreLabel}
                    style={LABEL_STYLE}
                  />
                </Bar>
                <Bar dataKey="toScore" fill="var(--color-toScore)" radius={[3, 3, 0, 0]}>
                  <LabelList
                    dataKey="toScore"
                    position="top"
                    offset={LABEL_OFFSET}
                    formatter={formatScoreLabel}
                    style={LABEL_STYLE}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-charcoal">
            {dataDate ? DASHBOARD_SHARED_TEXT.dataAsOf(dataDate) : ''}
          </p>
          <CardFooterButton
            label={PROVINCE_COMPARISON_TEXT.footerLink}
            onClick={() => setScoresOpen(true)}
          />
        </div>

        <StoreScoresDialog open={isScoresOpen} onOpenChange={setScoresOpen} />
      </CardContent>
    </Card>
  );
}
