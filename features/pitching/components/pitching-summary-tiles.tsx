'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import {
  PITCHING_DASHBOARD_TEXT,
  PITCHING_LEVEL_LABELS,
  PITCHING_RECOMMENDATION_LABELS,
  PITCHING_TEXT,
  PITCHING_TOTAL_MAX,
} from '../constants/pitching.constants';
import type { PitchingStoreReport } from '../types/pitching.types';
import { pickMajorityRecommendation } from '../utils/pitching-recommendation';

interface PitchingSummaryTilesProps {
  report: PitchingStoreReport;
}

export function PitchingSummaryTiles({ report }: PitchingSummaryTilesProps) {
  const majority = pickMajorityRecommendation(report.recommendationCounts);
  const selectedShare =
    report.judgeCount === 0 ? 0 : (report.recommendationCounts.SELECTED / report.judgeCount) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-purple-banner">
          <BarChart3 className="h-4 w-4" />
          {PITCHING_DASHBOARD_TEXT.summaryTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <SummaryTile
          title={PITCHING_DASHBOARD_TEXT.avgTileTitle}
          value={(report.avgScore ?? 0).toFixed(1)}
          unit={PITCHING_DASHBOARD_TEXT.outOf(PITCHING_TOTAL_MAX)}
          valueClassName="text-purple-banner"
        />
        <SummaryTile
          title={PITCHING_DASHBOARD_TEXT.rankTileTitle}
          value={report.rank ?? PITCHING_TEXT.noComment}
          unit={`${PITCHING_DASHBOARD_TEXT.outOf(report.rankedStoreCount)} ${PITCHING_DASHBOARD_TEXT.rankTileUnit}`}
          valueClassName="text-purple-banner"
        />
        <SummaryTile
          title={PITCHING_DASHBOARD_TEXT.selectedShareTileTitle}
          value={PITCHING_DASHBOARD_TEXT.selectedShareValue(selectedShare)}
          description={PITCHING_DASHBOARD_TEXT.selectedShareDescription(
            report.recommendationCounts.SELECTED,
            report.judgeCount
          )}
          valueClassName="text-score-green"
        />
        <SummaryTile
          title={PITCHING_DASHBOARD_TEXT.verdictTileTitle}
          value={report.level ? PITCHING_LEVEL_LABELS[report.level] : PITCHING_TEXT.noComment}
          description={
            majority
              ? PITCHING_RECOMMENDATION_LABELS[majority]
              : PITCHING_DASHBOARD_TEXT.verdictNone
          }
          valueClassName="text-lg text-purple-banner"
        />
      </CardContent>
    </Card>
  );
}

interface SummaryTileProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  valueClassName?: string;
}

function SummaryTile({ title, value, unit, description, valueClassName }: SummaryTileProps) {
  return (
    <Card className="border-0 bg-muted/50 shadow-none">
      <CardContent className="space-y-1 p-4 text-center">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className={cn('text-2xl font-bold tabular-nums', valueClassName)}>
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
