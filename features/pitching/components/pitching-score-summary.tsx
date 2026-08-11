import { ProgressBar } from '@/components/shared/progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PITCHING_LEVEL_BANDS,
  PITCHING_LEVEL_PROGRESS_COLORS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingCriterionScore, PitchingRound } from '../types/pitching.types';
import { summarizePitchingScore } from '../utils/pitching-level';
import { PitchingLevelBadge } from './pitching-level-badge';

interface PitchingScoreSummaryProps {
  round: PitchingRound;
  criteria: PitchingCriterionScore[];
}

/**
 * The running total of the form being filled in, and the band that total falls
 * in right now. Reads the same draft the criteria table writes, so it moves as
 * the judge types — nothing here is fetched, and nothing is submitted.
 */
export function PitchingScoreSummary({ round, criteria }: PitchingScoreSummaryProps) {
  const { total, maxTotal, scoredCount, criteriaCount, level, isComplete } =
    summarizePitchingScore(criteria);
  const band = PITCHING_LEVEL_BANDS[round].find((item) => item.level === level);

  return (
    // Labelled as a region: the four band names also appear in the เกณฑ์พิจารณา
    // table below, so this card has to be addressable on its own.
    <Card role="region" aria-label={PITCHING_TEXT.runningTotalTitle}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{PITCHING_TEXT.runningTotalTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-3xl font-bold tabular-nums text-orange">
            {total}
            <span className="ml-1 text-base font-normal text-muted-foreground">/ {maxTotal}</span>
          </p>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground">{PITCHING_TEXT.runningTotalLevelLabel}</p>
            <PitchingLevelBadge level={level} />
          </div>
        </div>

        <ProgressBar
          value={maxTotal === 0 ? 0 : (total / maxTotal) * 100}
          color={PITCHING_LEVEL_PROGRESS_COLORS[level]}
          label={PITCHING_TEXT.runningTotalScored(scoredCount, criteriaCount)}
        />

        {band && <p className="text-sm text-muted-foreground">{band.guidance}</p>}

        {!isComplete && (
          <p className="text-xs text-muted-foreground">{PITCHING_TEXT.runningTotalIncomplete}</p>
        )}
      </CardContent>
    </Card>
  );
}
