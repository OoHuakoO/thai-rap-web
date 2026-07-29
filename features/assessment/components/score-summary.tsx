'use client';

import { useEffect, useState } from 'react';
import { Binoculars, Box } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import {
  useAssessmentByRound,
  useAssessmentRank,
  useAssessmentSummaries,
  useDimensions,
} from '../hooks/use-assessment';
import { getZone, IMPROVEMENT_POINTS_COUNT } from '../utils/zone';
import { getLatestCompletedRound, isRoundCompleted } from '../utils/round';
import { isCompletedStatus } from '../utils/status';
import { calcScorePercent, sumQuestionScores } from '../utils/dimension-score';
import { SCORE_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import { RED_FLAG_LABELS, ROUNDS } from '../types/assessment.types';
import { ScoreSummaryRank } from './score-summary-rank';
import { ScoreSummaryChart } from './score-summary-chart';
import { ScoreSummaryRoundPicker } from './score-summary-round-picker';
import { ScoreSummaryStoreHeader } from './score-summary-store-header';
import { ScoreSummaryZone } from './score-summary-zone';
import type { AssessmentQuestion, RedFlag, Round } from '../types/assessment.types';
import type { Store } from '@/features/store';

interface ScoreSummaryProps {
  storeId: string;
  /** The round open in the form — only used until the store completes a round. */
  round: Round;
  store?: Store;
  selectedDimId: number;
  totalScore: number | null;
  currentScore: number;
  questions: AssessmentQuestion[];
  redFlags: RedFlag[];
  isSubmitted: boolean;
  className?: string;
}

export function ScoreSummary({
  storeId,
  round,
  store,
  selectedDimId,
  totalScore,
  currentScore,
  questions,
  redFlags,
  isSubmitted,
  className,
}: ScoreSummaryProps) {
  const { data: dimensions } = useDimensions();
  const { data: summaries } = useAssessmentSummaries(storeId);

  // A round the reader picked for this card, independent of the one open in the
  // form. Cleared on store change — a pick means "T1 of this store", and would
  // otherwise carry over to a store that may not even have a T1.
  const [pickedRound, setPickedRound] = useState<Round | null>(null);
  useEffect(() => setPickedRound(null), [storeId]);

  // This card describes the store, not the form. With nothing picked it reads
  // the latest round the store actually completed — otherwise opening T2 with
  // two questions scored would replace the store's real T1 result with ~0%.
  // Before any round is completed there is nothing to fall back to but the
  // round being filled in, which is what the props carry.
  const latestRound = getLatestCompletedRound(summaries);
  const sourceRound = pickedRound ?? latestRound ?? round;
  const isSourceOpenInForm = sourceRound === round;

  // The form's round always has a record (it is created on open), so it belongs
  // in the list even before the summaries query resolves.
  const availableRounds = ROUNDS.filter(
    (r) => r === round || summaries?.some((s) => s.round === r)
  );
  const completedRounds = availableRounds.filter((r) => isRoundCompleted(summaries, r));

  const { data: latestAssessment } = useAssessmentByRound(storeId, sourceRound, {
    enabled: !isSourceOpenInForm,
  });
  const { data: rank } = useAssessmentRank(storeId, sourceRound);

  const source = isSourceOpenInForm
    ? { questions, totalScore, currentScore, redFlags, isSubmitted }
    : latestAssessment
      ? {
          questions: latestAssessment.questions,
          totalScore: latestAssessment.totalScore,
          currentScore: latestAssessment.currentScore,
          redFlags: latestAssessment.redFlags,
          isSubmitted: isCompletedStatus(latestAssessment.status),
        }
      : null;

  const dimensionScores = (dimensions ?? []).map((dim) => {
    const dimQuestions = (source?.questions ?? []).filter((q) => q.dimensionId === dim.id);
    const { sum, max } = sumQuestionScores(dimQuestions);
    return {
      ...dim,
      pct: calcScorePercent(sum, max, 1),
      // Its percentage is only final once every question in it is answered.
      isFullyScored: dimQuestions.length > 0 && dimQuestions.every((q) => q.rawScore !== null),
    };
  });

  const selectedDim = dimensionScores.find((d) => d.id === selectedDimId);

  // Weak points are always the 3 lowest-scored dimensions, ranked regardless
  // of the pass mark. A half-scored dimension sits low by arithmetic alone,
  // so it's excluded until complete — otherwise a round nobody has touched
  // lists dimensions as weak, which is the same misreading the zone gate avoids.
  const improvementPoints = dimensionScores
    .filter((dim) => dim.isFullyScored)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, IMPROVEMENT_POINTS_COUNT);

  // A round that isn't submitted has no frozen totalScore, so it shows the
  // running one instead — same formula, so the number doesn't jump at submit.
  // With nothing scored at all that running score is a meaningless 0, and the
  // card says "no score yet" rather than calling a fresh round a Red Zone.
  const isProvisional = source !== null && source.totalScore === null;
  const score = source?.totalScore ?? source?.currentScore ?? 0;
  const scoredCount = source?.questions.filter((q) => q.rawScore !== null).length ?? 0;
  const hasScore = source !== null && (source.totalScore !== null || scoredCount > 0);
  // The zone is a verdict on the whole round, so it waits for the whole round.
  // Two questions in, the running score is genuinely low but calling that a Red
  // Zone reads as "this restaurant is failing" when it only means "barely
  // assessed" — the same misreading the running score itself exists to avoid.
  const isFullyScored =
    source !== null && source.questions.length > 0 && scoredCount === source.questions.length;
  const showZone = source !== null && (source.totalScore !== null || isFullyScored);
  const zone = getZone(score);

  // One picker governs the whole card: the tiles, the rank, the weak points and
  // the radar all read the round it selects.
  const header = (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-charcoal">{SCORE_SUMMARY_TEXT.title}</p>
        <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
          {isRoundCompleted(summaries, sourceRound)
            ? SCORE_SUMMARY_TEXT.latestRoundBadge(sourceRound)
            : SCORE_SUMMARY_TEXT.currentRoundBadge(sourceRound)}
        </span>
      </div>
      <ScoreSummaryRoundPicker
        rounds={availableRounds}
        value={sourceRound}
        completedRounds={completedRounds}
        onChange={setPickedRound}
      />
    </div>
  );

  if (!source) {
    return (
      <Card className={cn('h-full overflow-y-auto', className)}>
        <CardContent className="space-y-3 pt-5">
          {header}
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full overflow-y-auto', className)}>
      <CardContent className="space-y-3 pt-5">
        {header}

        {store && <ScoreSummaryStoreHeader store={store} />}

        <div className="grid grid-cols-[1fr_1.3fr] gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Box className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10.5px] leading-tight text-muted-foreground">
                {SCORE_SUMMARY_TEXT.selectedDimScore}
              </p>
              <p className="text-base font-extrabold text-orange">
                {selectedDim ? selectedDim.pct.toFixed(1) : '0.0'}
                <span className="text-[11.5px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange text-white">
              <Binoculars className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10.5px] leading-tight text-muted-foreground">
                {SCORE_SUMMARY_TEXT.weightedScore}
              </p>
              <p className="text-base font-extrabold text-dark-nav">
                {hasScore ? score.toFixed(2) : '—'}
                <span className="text-[11.5px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
        </div>

        <ScoreSummaryRank storeId={storeId} round={sourceRound} />

        <ScoreSummaryZone
          zone={zone}
          showZone={showZone}
          scoredCount={scoredCount}
          totalQuestions={source.questions.length}
          isSubmitted={source.isSubmitted}
          isProvisional={isProvisional}
        />

        {source.redFlags.length > 0 && (
          <div className="border-t pt-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-destructive">
              {SCORE_SUMMARY_TEXT.redFlagsTitle}
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10.5px] font-bold text-white">
                {source.redFlags.length}
              </span>
            </p>
            <ul className="space-y-1">
              {source.redFlags.map((flag) => (
                <li
                  key={flag.id}
                  className="flex items-start gap-1.5 text-[12.5px] leading-tight text-charcoal"
                >
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-destructive" />
                  {RED_FLAG_LABELS[flag.type]}
                  {flag.recommendation ? `: ${flag.recommendation}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-2.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-bold text-orange">
            {SCORE_SUMMARY_TEXT.improvementTitle}
            {improvementPoints.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10.5px] font-bold text-white">
                {improvementPoints.length}
              </span>
            )}
          </p>
          {improvementPoints.length === 0 ? (
            // The list is empty only when no dimension is complete: any fully
            // scored dimension is ranked, however high it scored. So there is
            // no "every dimension passed" case to word — that copy belonged to
            // an earlier pass-mark rule and would be unreachable here.
            <p className="text-[12.5px] text-muted-foreground">
              {SCORE_SUMMARY_TEXT.improvementPending}
            </p>
          ) : (
            <ul className="space-y-1">
              {improvementPoints.map((dim) => (
                <li
                  key={dim.id}
                  className="flex items-start gap-1.5 text-[12.5px] leading-tight text-charcoal"
                >
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-orange" />
                  <span className="flex-1">
                    {dim.name} ({SCORE_SUMMARY_TEXT.dimensionAxisLabel(dim.id)})
                  </span>
                  <span className="flex-shrink-0 font-bold text-orange">
                    {SCORE_SUMMARY_TEXT.dimensionPercent(dim.pct)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ScoreSummaryChart
          dimensionScores={dimensionScores}
          dimensionAverages={rank?.dimensionAverages ?? []}
        />
      </CardContent>
    </Card>
  );
}
