'use client';

import {
  CircleAlert,
  CircleCheck,
  Lightbulb,
  MessageSquareQuote,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { DownloadButtons } from '@/components/shared/download-buttons';
import { CardSkeleton } from '@/components/shared/loading';
import { ProgressBar } from '@/components/shared/progress-bar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { getInitials } from '@/utils/get-initials';
import {
  PITCHING_AVG_SCORE_DECIMALS,
  PITCHING_COMMENT_FIELDS,
  PITCHING_COMMENT_TONES,
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_EDGE_CLASSES,
  PITCHING_LEVEL_LABELS,
  PITCHING_LEVEL_PROGRESS_COLORS,
  PITCHING_LEVEL_TEXT_CLASSES,
  PITCHING_RECOMMENDATION_BADGE_CLASSES,
  PITCHING_RECOMMENDATION_LABELS,
  PITCHING_TEXT,
  type PitchingCommentTone,
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

interface PitchingStoreReportPanelProps {
  storeId: string;
  round: PitchingRound;
}

// A comment box's colour is what it is about, not who wrote it: green for what
// works, red for what does not, purple for upside, orange for the next step.
const TONE_STYLES: Record<PitchingCommentTone, { box: string; text: string; icon: LucideIcon }> = {
  positive: {
    box: 'border-score-green/25 bg-score-green/[0.06]',
    text: 'text-score-green',
    icon: CircleCheck,
  },
  concern: {
    box: 'border-score-red/25 bg-score-red/[0.06]',
    text: 'text-score-red',
    icon: CircleAlert,
  },
  potential: {
    box: 'border-purple-banner/25 bg-purple-banner/[0.06]',
    text: 'text-purple-banner',
    icon: TrendingUp,
  },
  advice: {
    box: 'border-orange/25 bg-orange/[0.06]',
    text: 'text-orange',
    icon: Lightbulb,
  },
};

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
            {report.level && (
              <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[report.level]}>
                {PITCHING_LEVEL_LABELS[report.level]}
              </Badge>
            )}
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
            const criterionLevel = getPitchingLevel(criterion.avgPct);

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
                <ProgressBar
                  value={criterion.avgPct}
                  color={PITCHING_LEVEL_PROGRESS_COLORS[criterionLevel]}
                />
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
            <JudgeResult key={judge.id} judge={judge} round={round} />
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
        <Badge key={key} variant="outline" className={PITCHING_RECOMMENDATION_BADGE_CLASSES[key]}>
          {PITCHING_RECOMMENDATION_LABELS[key]} ·{' '}
          {PITCHING_TEXT.recommendationCountValue(counts[key])}
        </Badge>
      ))}
    </div>
  );
}

interface JudgeResultProps {
  judge: Pitching;
  round: PitchingRound;
}

function JudgeResult({ judge, round }: JudgeResultProps) {
  const level: PitchingLevel = judge.level ?? getPitchingLevel(judge.totalScore ?? 0);

  return (
    <article
      className={cn(
        'space-y-3 rounded-xl border border-l-4 p-4',
        PITCHING_LEVEL_EDGE_CLASSES[level]
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-purple-banner/10 text-purple-banner">
              {getInitials(judge.judgeName)}
            </AvatarFallback>
          </Avatar>
          <p className="min-w-0 truncate text-sm font-semibold text-text-main">{judge.judgeName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {judge.recommendation && (
            <Badge
              variant="outline"
              className={PITCHING_RECOMMENDATION_BADGE_CLASSES[judge.recommendation]}
            >
              {PITCHING_RECOMMENDATION_LABELS[judge.recommendation]}
            </Badge>
          )}
          {judge.level && (
            <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[judge.level]}>
              {PITCHING_LEVEL_LABELS[judge.level]}
            </Badge>
          )}
          <span
            className={cn('text-lg font-bold tabular-nums', PITCHING_LEVEL_TEXT_CLASSES[level])}
          >
            {PITCHING_TEXT.totalOutOf(judge.totalScore ?? 0)}
          </span>
        </div>
      </div>

      {judge.minimumConditions && (
        <p
          className={cn(
            'flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-xs',
            judge.minimumConditions.passed
              ? 'border-score-green/25 bg-score-green/[0.06] text-score-green'
              : 'border-score-red/25 bg-score-red/[0.06] text-score-red'
          )}
        >
          {judge.minimumConditions.passed ? (
            <CircleCheck className="h-4 w-4 flex-shrink-0" />
          ) : (
            <CircleAlert className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="font-semibold">
            {judge.minimumConditions.passed
              ? PITCHING_TEXT.minimumPassed
              : PITCHING_TEXT.minimumFailed}
          </span>
          <span className="text-charcoal">
            {PITCHING_TEXT.scoreCardLabel}: {judge.minimumConditions.scoreCardTotal ?? '—'}
            {' · '}
            {PITCHING_TEXT.participationLabel}: {judge.minimumConditions.participationPct ?? '—'}
          </span>
        </p>
      )}

      {judge.recommendationReason && (
        <blockquote className="rounded-lg border-l-2 border-charcoal/30 bg-charcoal/[0.04] px-3 py-2.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-charcoal">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            {PITCHING_TEXT.verdictReasonLabel}
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-main">
            {judge.recommendationReason}
          </p>
        </blockquote>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {PITCHING_COMMENT_FIELDS[round].map((field) => (
          <CommentBox
            key={field.key}
            label={field.label}
            value={judge.comments[field.key]}
            tone={PITCHING_COMMENT_TONES[field.key] ?? 'advice'}
          />
        ))}
      </div>
    </article>
  );
}

interface CommentBoxProps {
  label: string;
  value: string | undefined;
  tone: PitchingCommentTone;
}

/**
 * One comment box. A box the judge left blank still shows — a missing answer is
 * itself a finding — but drops to a dashed grey outline so a scan reads the
 * filled ones first.
 */
function CommentBox({ label, value, tone }: CommentBoxProps) {
  const text = value?.trim() ?? '';
  const style = TONE_STYLES[tone];
  const Icon = style.icon;

  if (!text) {
    return (
      <div className="space-y-1 rounded-lg border border-dashed bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{PITCHING_TEXT.noCommentHint}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1 rounded-lg border p-3', style.box)}>
      <p className={cn('flex items-center gap-1.5 text-xs font-semibold', style.text)}>
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        {label}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-main">{text}</p>
    </div>
  );
}
