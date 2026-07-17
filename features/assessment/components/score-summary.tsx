'use client';

import { Binoculars, Box, MapPin, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { ProgressBar } from '@/components/shared/progress-bar';
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge';
import { cn } from '@/utils/cn';
import { useDimensions, useAssessmentRank } from '../hooks/use-assessment';
import { getZone, ZONE_DESCRIPTIONS, ZONE_COLORS, ZONE_BADGE_CLASSES } from '../utils/zone';
import { SCORE_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import { RED_FLAG_LABELS } from '../types/assessment.types';
import type { AssessmentQuestion, RedFlag, Round } from '../types/assessment.types';
import { STORE_STATUS_LABELS } from '@/features/store';
import type { Store, StoreStatus } from '@/features/store';

const STATUS_VARIANT: Record<StoreStatus, StatusVariant> = {
  REGISTERED: 'new',
  T0_COMPLETED: 'pending',
  CAMP_COMPLETED: 'pending',
  T1_COMPLETED: 'pending',
  PITCHING_COMPLETED: 'pending',
  SELECTED: 'pass',
  CONDITIONAL_SELECTED: 'warning',
  WAITING_LIST: 'pending',
  NOT_SELECTED: 'fail',
  FIELD_AUDITED: 'pending',
  IDP_CREATED: 'pending',
  COMPLETED: 'active',
};

const radarChartConfig = {
  thisStore: { label: SCORE_SUMMARY_TEXT.radarThisStore, color: 'rgb(var(--color-orange))' },
  average: { label: SCORE_SUMMARY_TEXT.radarAverage, color: 'rgb(var(--color-dark-nav))' },
} satisfies ChartConfig;

interface ScoreSummaryProps {
  storeId: string;
  round: Round;
  store?: Store;
  selectedDimId: number;
  totalScore: number | null;
  questions: AssessmentQuestion[];
  redFlags: RedFlag[];
  isSubmitted: boolean;
}

export function ScoreSummary({
  storeId,
  round,
  store,
  selectedDimId,
  totalScore,
  questions,
  redFlags,
  isSubmitted,
}: ScoreSummaryProps) {
  const { data: dimensions } = useDimensions();
  const { data: rank } = useAssessmentRank(storeId, round);

  const score = totalScore ?? 0;
  const zone = getZone(score);
  const zoneColor = ZONE_COLORS[zone];

  const dimensionScores = (dimensions ?? []).map((dim) => {
    const dimQuestions = questions.filter((q) => q.dimensionId === dim.id);
    const sum = dimQuestions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0);
    const max = dimQuestions.length * 4;
    const pct = max === 0 ? 0 : Math.round((sum / max) * 1000) / 10;
    return { ...dim, pct };
  });

  const selectedDim = dimensionScores.find((d) => d.id === selectedDimId);

  const improvementPoints = [...dimensionScores].sort((a, b) => a.pct - b.pct).slice(0, 3);

  const radarData = dimensionScores.map((dim) => {
    const avg = rank?.dimensionAverages.find((a) => a.dimensionId === dim.id)?.avgPct ?? 0;
    return {
      dimension: SCORE_SUMMARY_TEXT.dimensionAxisLabel(dim.id),
      thisStore: dim.pct,
      average: avg,
    };
  });

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-charcoal">{SCORE_SUMMARY_TEXT.title}</p>
          <span className="cursor-default text-[9.5px] text-orange underline">
            {SCORE_SUMMARY_TEXT.fullReport}
          </span>
        </div>

        {store && (
          <div className="flex items-center gap-2 border-b pb-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange to-orange-light text-base text-white">
              🍜
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-charcoal">{store.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{store.province}</p>
            </div>
            <StatusBadge
              status={STATUS_VARIANT[store.status]}
              label={STORE_STATUS_LABELS[store.status]}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Box className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[9px] leading-tight text-muted-foreground">
                {SCORE_SUMMARY_TEXT.selectedDimScore}
              </p>
              <p className="text-base font-extrabold text-orange">
                {selectedDim ? selectedDim.pct.toFixed(1) : '0.0'}
                <span className="text-[10px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange text-white">
              <Binoculars className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[9px] leading-tight text-muted-foreground">
                {SCORE_SUMMARY_TEXT.weightedScore}
              </p>
              <p className="text-base font-extrabold text-dark-nav">
                {score.toFixed(2)}
                <span className="text-[10px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
        </div>

        {rank && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[9px] text-muted-foreground">
                  {SCORE_SUMMARY_TEXT.provinceRank}
                </p>
                <p className="text-sm font-extrabold text-dark-nav">
                  {rank.provinceRank ?? '—'}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {' '}
                    / {rank.provinceTotal}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Trophy className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[9px] text-muted-foreground">
                  {SCORE_SUMMARY_TEXT.overallRank}
                </p>
                <p className="text-sm font-extrabold text-dark-nav">
                  {rank.overallRank ?? '—'}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {' '}
                    / {rank.overallTotal}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-bold',
            ZONE_BADGE_CLASSES[zoneColor]
          )}
        >
          <span>{totalScore !== null ? zone : SCORE_SUMMARY_TEXT.noScore}</span>
          {isSubmitted && (
            <span className="text-[10px] font-semibold">{SCORE_SUMMARY_TEXT.submitted}</span>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {totalScore !== null ? ZONE_DESCRIPTIONS[zone] : SCORE_SUMMARY_TEXT.noScoreDescription}
        </p>

        {redFlags.length > 0 && (
          <div className="border-t pt-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-destructive">
              {SCORE_SUMMARY_TEXT.redFlagsTitle}
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {redFlags.length}
              </span>
            </p>
            <ul className="space-y-1">
              {redFlags.map((flag) => (
                <li
                  key={flag.id}
                  className="flex items-start gap-1.5 text-[11px] leading-tight text-charcoal"
                >
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-destructive" />
                  {RED_FLAG_LABELS[flag.type]}
                  {flag.recommendation ? `: ${flag.recommendation}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvementPoints.length > 0 && (
          <div className="border-t pt-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-orange">
              {SCORE_SUMMARY_TEXT.improvementTitle}
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[9px] font-bold text-white">
                {improvementPoints.length}
              </span>
            </p>
            <ul className="space-y-1">
              {improvementPoints.map((dim) => (
                <li
                  key={dim.id}
                  className="flex items-start gap-1.5 text-[11px] leading-tight text-charcoal"
                >
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-orange" />
                  {dim.name} ({SCORE_SUMMARY_TEXT.dimensionAxisLabel(dim.id)})
                </li>
              ))}
            </ul>
          </div>
        )}

        <Accordion type="single" collapsible className="border-t">
          <AccordionItem value="compare" className="border-none">
            <AccordionTrigger className="py-2.5 text-[11px] font-bold text-charcoal hover:no-underline">
              {SCORE_SUMMARY_TEXT.compareTitle}
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pb-0 pt-0">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
