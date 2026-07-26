'use client';

import { ClipboardCheck } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { colors } from '@/styles/tokens';
import { ANALYTICS_ACCENT_CLASS } from '../constants/analytics-display.constants';
import { INCUBATION_STATUS_TEXT } from '../constants/analytics-text.constants';
import type { IncubationStatus } from '../types/analytics.types';

interface IncubationStatusCardProps {
  incubationStatus: IncubationStatus | null;
}

const accentClass = ANALYTICS_ACCENT_CLASS.purple;

const DONUT_SIZE = 84;
const CHANCE_MAX = 100;

const chartConfig: ChartConfig = {
  chance: { label: INCUBATION_STATUS_TEXT.chanceLabel, color: colors.purpleBanner },
};

export function IncubationStatusCard({ incubationStatus }: IncubationStatusCardProps) {
  const chance = Math.min(CHANCE_MAX, Math.max(0, incubationStatus?.chance ?? 0));
  const donutData = [
    { name: 'chance', value: chance },
    { name: 'rest', value: CHANCE_MAX - chance },
  ];

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader
        className={`flex flex-row items-center gap-2 space-y-0 py-2.5 ${accentClass.header}`}
      >
        <ClipboardCheck className={`h-4 w-4 shrink-0 ${accentClass.text}`} />
        <CardTitle className={`text-[13px] font-semibold ${accentClass.text}`}>
          {INCUBATION_STATUS_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        {!incubationStatus ? (
          <p className="text-xs text-muted-foreground">{INCUBATION_STATUS_TEXT.empty}</p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className={`text-sm font-bold ${accentClass.text}`}>{incubationStatus.status}</p>
              <p className="text-xs text-charcoal">
                <span className="text-muted-foreground">{INCUBATION_STATUS_TEXT.stepLabel}</span>{' '}
                {incubationStatus.step}
              </p>
              <p className="text-xs text-charcoal">
                <span className="text-muted-foreground">{INCUBATION_STATUS_TEXT.chanceLabel}</span>{' '}
                {INCUBATION_STATUS_TEXT.chanceValue(incubationStatus.chance)}
              </p>
            </div>

            <div className="relative shrink-0" style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
              <ChartContainer
                config={chartConfig}
                className="h-full w-full"
                style={{ height: DONUT_SIZE }}
              >
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                    stroke="none"
                  >
                    <Cell fill={colors.purpleBanner} />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <span
                className={`pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums ${accentClass.text}`}
              >
                {INCUBATION_STATUS_TEXT.chanceValue(incubationStatus.chance)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
