'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ProgressBar } from '@/components/shared/progress-bar';
import { SCORE_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import type { DimensionAverage } from '../types/assessment.types';

const radarChartConfig = {
  thisStore: { label: SCORE_SUMMARY_TEXT.radarThisStore, color: 'rgb(var(--color-orange))' },
  average: { label: SCORE_SUMMARY_TEXT.radarAverage, color: 'rgb(var(--color-dark-nav))' },
} satisfies ChartConfig;

export interface DimensionScore {
  id: number;
  nameEn: string;
  pct: number;
}

interface ScoreSummaryChartProps {
  dimensionScores: DimensionScore[];
  dimensionAverages: DimensionAverage[];
}

export function ScoreSummaryChart({
  dimensionScores,
  dimensionAverages,
}: ScoreSummaryChartProps) {
  const radarData = dimensionScores.map((dim) => ({
    dimension: SCORE_SUMMARY_TEXT.dimensionAxisLabel(dim.id),
    thisStore: dim.pct,
    average: dimensionAverages.find((a) => a.dimensionId === dim.id)?.avgPct ?? 0,
  }));

  return (
    <div className="space-y-2 border-t pt-2.5">
      <p className="text-[12.5px] font-bold text-charcoal">{SCORE_SUMMARY_TEXT.compareTitle}</p>
      <ChartContainer config={radarChartConfig} style={{ height: 180 }}>
        <RadarChart data={radarData}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 8 }} />
          <Radar
            dataKey="thisStore"
            stroke="var(--color-thisStore)"
            fill="var(--color-thisStore)"
            fillOpacity={0.25}
          />
          <Radar
            dataKey="average"
            stroke="var(--color-average)"
            fill="var(--color-average)"
            fillOpacity={0.08}
            strokeDasharray="4 3"
          />
        </RadarChart>
      </ChartContainer>
      <div className="space-y-1.5">
        {dimensionScores.map((dim) => (
          <ProgressBar key={dim.id} value={dim.pct} label={dim.nameEn} showPercentage />
        ))}
      </div>
    </div>
  );
}
