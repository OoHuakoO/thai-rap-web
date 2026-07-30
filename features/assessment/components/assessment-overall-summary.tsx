'use client';

import { Layers, Sigma } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProgressBar } from '@/components/shared/progress-bar';
import { cn } from '@/utils/cn';
import {
  useAssessmentsByRounds,
  useAssessmentSummaries,
  useDimensions,
} from '../hooks/use-assessment';
import { buildOverallSummary } from '../utils/overall-summary';
import { isRoundCompleted } from '../utils/round';
import { getZone, ZONE_BADGE_CLASSES, ZONE_COLORS } from '../utils/zone';
import { OVERALL_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import { ROUNDS } from '../types/assessment.types';

interface AssessmentOverallSummaryProps {
  storeId: string;
  className?: string;
}

/**
 * The cross-round section: every finished round of this store combined into one
 * average per dimension plus one overall score. Deliberately store-wide and
 * round-agnostic — ScoreSummary answers "how is this round going", this answers
 * "where does the store stand across everything assessed so far".
 */
export function AssessmentOverallSummary({ storeId, className }: AssessmentOverallSummaryProps) {
  const { data: dimensions } = useDimensions();
  const { data: summaries, isLoading: isSummariesLoading } = useAssessmentSummaries(storeId);

  const completedRounds = ROUNDS.filter((round) => isRoundCompleted(summaries, round));
  const { data: assessments, isLoading: isAssessmentsLoading } = useAssessmentsByRounds(
    storeId,
    completedRounds
  );

  const summary = buildOverallSummary(
    assessments.map((assessment) => ({
      round: assessment.round,
      totalScore: assessment.totalScore,
      questions: assessment.questions,
    })),
    dimensions ?? []
  );

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-base font-bold text-charcoal">{OVERALL_SUMMARY_TEXT.title}</p>
        <p className="text-sm text-muted-foreground">{OVERALL_SUMMARY_TEXT.subtitle}</p>
      </div>
      {completedRounds.length > 0 && (
        <span className="flex-shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {OVERALL_SUMMARY_TEXT.roundsIncluded(completedRounds.length)}
        </span>
      )}
    </div>
  );

  if (isSummariesLoading || (completedRounds.length > 0 && isAssessmentsLoading)) {
    return (
      <Card className={className}>
        <CardContent className="space-y-3 pt-5">
          {header}
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardContent className="space-y-3 pt-5">
          {header}
          <p className="py-6 text-center text-sm text-muted-foreground">
            {OVERALL_SUMMARY_TEXT.empty}
          </p>
        </CardContent>
      </Card>
    );
  }

  const zone = getZone(summary.averageTotalScore);
  const roundsShown = summary.roundTotals.map((entry) => entry.round);

  return (
    <Card className={className}>
      <CardContent className="space-y-4 pt-5">
        {header}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange text-white">
              <Sigma className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {OVERALL_SUMMARY_TEXT.averageTotalScore}
              </p>
              <p className="text-lg font-extrabold text-dark-nav">
                {OVERALL_SUMMARY_TEXT.score(summary.averageTotalScore)}
                <span className="text-xs font-normal text-muted-foreground">/100</span>
              </p>
            </div>
            <span
              className={cn(
                'ml-auto flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                ZONE_BADGE_CLASSES[ZONE_COLORS[zone]]
              )}
            >
              {zone}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Layers className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {OVERALL_SUMMARY_TEXT.averageDimensionPct}
              </p>
              <p className="text-lg font-extrabold text-orange">
                {OVERALL_SUMMARY_TEXT.percent(summary.averageDimensionPct)}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">{OVERALL_SUMMARY_TEXT.roundCountLabel}</p>
            <p className="text-sm font-bold text-charcoal">
              {roundsShown.join(' · ')} ({OVERALL_SUMMARY_TEXT.roundCountValue(roundsShown.length)})
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">
                {OVERALL_SUMMARY_TEXT.columnDimension}
              </TableHead>
              <TableHead className="w-[90px] text-right">
                {OVERALL_SUMMARY_TEXT.columnWeight}
              </TableHead>
              {roundsShown.map((round) => (
                <TableHead key={round} className="w-[90px] text-right">
                  {round}
                </TableHead>
              ))}
              <TableHead className="w-[200px]">{OVERALL_SUMMARY_TEXT.columnAverage}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.dimensions.map((dim) => (
              <TableRow key={dim.id}>
                <TableCell className="font-medium text-charcoal">
                  {dim.id}. {dim.name}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {OVERALL_SUMMARY_TEXT.weightPercent(dim.weight)}
                </TableCell>
                {roundsShown.map((round) => {
                  const pct = dim.pctByRound[round];
                  return (
                    <TableCell key={round} className="text-right tabular-nums">
                      {pct === null || pct === undefined
                        ? OVERALL_SUMMARY_TEXT.noRoundValue
                        : OVERALL_SUMMARY_TEXT.percent(pct)}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={dim.avgPct} className="flex-1" />
                    <span className="w-14 flex-shrink-0 text-right text-sm font-bold tabular-nums text-orange">
                      {OVERALL_SUMMARY_TEXT.percent(dim.avgPct)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold text-charcoal">
                {OVERALL_SUMMARY_TEXT.totalRowLabel}
              </TableCell>
              <TableCell />
              {summary.roundTotals.map((entry) => (
                <TableCell key={entry.round} className="text-right tabular-nums">
                  {OVERALL_SUMMARY_TEXT.score(entry.totalScore)}
                </TableCell>
              ))}
              <TableCell className="text-right font-extrabold tabular-nums text-dark-nav">
                {OVERALL_SUMMARY_TEXT.score(summary.averageTotalScore)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
