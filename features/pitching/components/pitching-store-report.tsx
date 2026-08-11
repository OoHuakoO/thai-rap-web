'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { DownloadButtons } from '@/components/shared/download-buttons';
import { CardSkeleton } from '@/components/shared/loading';
import { ProgressBar } from '@/components/shared/progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgressColor } from '@/types';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  PITCHING_AVG_SCORE_DECIMALS,
  PITCHING_LEVEL_EDGE_CLASSES,
  PITCHING_LEVEL_PROGRESS_COLORS,
  PITCHING_LEVEL_TEXT_CLASSES,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { useExportPitchingStoreReport } from '../hooks/use-export-pitching';
import { usePitchingStoreReport } from '../hooks/use-pitching-report';
import type {
  Pitching,
  PitchingLevel,
  PitchingRecommendation,
  PitchingRecommendationCounts,
  PitchingRound,
} from '../types/pitching.types';
import { getPitchingLevel } from '../utils/pitching-level';
import { readJudgeOpinion } from '../utils/pitching-opinion';
import { PitchingCommentBox } from './pitching-comment-box';
import { PitchingJudgeIdentity } from './pitching-judge-identity';
import { PitchingLevelBadge } from './pitching-level-badge';
import { PitchingMinimumConditionsStrip } from './pitching-minimum-strip';
import { PitchingReasonQuote } from './pitching-reason-quote';
import { PitchingRecommendationBadge } from './pitching-recommendation-badge';

interface PitchingStoreReportPanelProps {
  storeId: string;
  round: PitchingRound;
}

const RECOMMENDATION_ORDER: readonly PitchingRecommendation[] = [
  'SELECTED',
  'WAITING_LIST',
  'MINIMUM_NOT_MET',
  'NOT_SELECTED',
];

export function PitchingStoreReportPanel({ storeId, round }: PitchingStoreReportPanelProps) {
  const { data: report, isLoading, isError, error } = usePitchingStoreReport(storeId, round);
  const { mutate: exportReport, isPending: isExporting } = useExportPitchingStoreReport();

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!report) return null;

  if (report.judgeCount === 0) {
    return <AlertCard variant="info" message={PITCHING_TEXT.storeReportEmpty} />;
  }

  const level = report.level ?? getPitchingLevel(report.avgScore ?? 0);

  return (
    <div className="space-y-4">
      <Card className={cn('border-l-4', PITCHING_LEVEL_EDGE_CLASSES[level])}>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">{report.storeName}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {report.storeCode}
              {report.province ? ` · ${report.province}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report.level && <PitchingLevelBadge level={report.level} />}
            <span
              className={cn('text-2xl font-bold tabular-nums', PITCHING_LEVEL_TEXT_CLASSES[level])}
            >
              {PITCHING_TEXT.totalOutOf(report.avgScore ?? 0)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              {report.rank !== null && (
                <span>{PITCHING_TEXT.rankOutOf(report.rank, report.rankedStoreCount)}</span>
              )}
              <span>
                {PITCHING_TEXT.judgeCountColumn}: {PITCHING_TEXT.judgeCountValue(report.judgeCount)}
              </span>
            </div>
            <DownloadButtons
              isExporting={isExporting}
              excelLabel={PITCHING_TEXT.downloadExcel}
              pdfLabel={PITCHING_TEXT.downloadPdf}
              onDownload={(format) => exportReport({ storeId, round, format })}
            />
          </div>

          <RecommendationCounts counts={report.recommendationCounts} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {PITCHING_TEXT.criterionAverageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.criteria.map((criterion) => {
            // The band a criterion's own percentage falls in — the same cut
            // points as a total, so a weak criterion reads red on a green card.
            // Only the score text carries the band in ACCELERATION; its bars
            // stay one colour, because 16 criteria in four colours read as a
            // legend the reader has to decode instead of a length comparison.
            const criterionLevel = getPitchingLevel(criterion.avgPct);
            const progressColor: ProgressColor =
              round === 'ACCELERATION' ? 'danger' : PITCHING_LEVEL_PROGRESS_COLORS[criterionLevel];

            return (
              <div key={criterion.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-text-main">
                    <span className="mr-2 text-muted-foreground">{criterion.code}</span>
                    {criterion.title}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 font-semibold tabular-nums',
                      PITCHING_LEVEL_TEXT_CLASSES[criterionLevel]
                    )}
                  >
                    {criterion.avgScore.toFixed(PITCHING_AVG_SCORE_DECIMALS)} / {criterion.maxScore}
                  </span>
                </div>
                <ProgressBar value={criterion.avgPct} color={progressColor} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {PITCHING_TEXT.judgeBreakdownTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.judges.map((judge) => (
            <JudgeResult key={judge.id} judge={judge} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** How the panel voted, as one strip — zero-count verdicts stay off it. */
function RecommendationCounts({ counts }: { counts: PitchingRecommendationCounts }) {
  const voted = RECOMMENDATION_ORDER.filter((key) => counts[key] > 0);
  if (voted.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-3">
      <span className="text-xs font-medium text-muted-foreground">
        {PITCHING_TEXT.recommendationCountsTitle}
      </span>
      {voted.map((key) => (
        <PitchingRecommendationBadge
          key={key}
          recommendation={key}
          suffix={` · ${PITCHING_TEXT.recommendationCountValue(counts[key])}`}
        />
      ))}
    </div>
  );
}

interface JudgeResultProps {
  judge: Pitching;
}

function JudgeResult({ judge }: JudgeResultProps) {
  const level: PitchingLevel = judge.level ?? getPitchingLevel(judge.totalScore ?? 0);
  const { summary, fields } = readJudgeOpinion(judge);

  return (
    <article
      className={cn(
        'space-y-3 rounded-xl border border-l-4 p-4',
        PITCHING_LEVEL_EDGE_CLASSES[level]
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PitchingJudgeIdentity judgeName={judge.judgeName} />
        <div className="flex flex-wrap items-center gap-2">
          {judge.recommendation && (
            <PitchingRecommendationBadge recommendation={judge.recommendation} />
          )}
          {judge.level && <PitchingLevelBadge level={judge.level} />}
          <span
            className={cn('text-lg font-bold tabular-nums', PITCHING_LEVEL_TEXT_CLASSES[level])}
          >
            {PITCHING_TEXT.totalOutOf(judge.totalScore ?? 0)}
          </span>
        </div>
      </div>

      {judge.minimumConditions && (
        <PitchingMinimumConditionsStrip conditions={judge.minimumConditions} />
      )}

      {summary && <PitchingReasonQuote reason={summary} accent="charcoal" />}

      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <PitchingCommentBox
            key={field.key}
            label={field.label}
            value={field.text}
            tone={field.tone}
          />
        ))}
      </div>
    </article>
  );
}
