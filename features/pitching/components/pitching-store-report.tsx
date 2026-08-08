'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { DownloadButtons } from '@/components/shared/download-buttons';
import { CardSkeleton } from '@/components/shared/loading';
import { ProgressBar } from '@/components/shared/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  PITCHING_COMMENT_FIELDS,
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_LABELS,
  PITCHING_RECOMMENDATION_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { useExportPitchingStoreReport } from '../hooks/use-export-pitching';
import { usePitchingStoreReport } from '../hooks/use-pitching-report';
import type { Pitching, PitchingRound } from '../types/pitching.types';

interface PitchingStoreReportPanelProps {
  storeId: string;
  round: PitchingRound;
}

export function PitchingStoreReportPanel({ storeId, round }: PitchingStoreReportPanelProps) {
  const { data: report, isLoading, isError, error } = usePitchingStoreReport(storeId, round);
  const { mutate: exportReport, isPending: isExporting } = useExportPitchingStoreReport();

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!report) return null;

  if (report.judgeCount === 0) {
    return <AlertCard variant="info" message={PITCHING_TEXT.storeReportEmpty} />;
  }

  return (
    <div className="space-y-4">
      <Card>
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
            <span className="text-lg font-semibold text-orange">
              {PITCHING_TEXT.totalOutOf(report.avgScore ?? 0)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {PITCHING_TEXT.criterionAverageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-text-main">
                  <span className="mr-2 text-muted-foreground">{criterion.code}</span>
                  {criterion.title}
                </span>
                <span className="shrink-0 font-medium">
                  {criterion.avgScore.toFixed(2)} / {criterion.maxScore}
                </span>
              </div>
              <ProgressBar value={criterion.avgPct} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {PITCHING_TEXT.judgeBreakdownTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.judges.map((judge, index) => (
            <div key={judge.id} className="space-y-2">
              {index > 0 && <Separator />}
              <JudgeResult judge={judge} round={round} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface JudgeResultProps {
  judge: Pitching;
  round: PitchingRound;
}

function JudgeResult({ judge, round }: JudgeResultProps) {
  return (
    <div className="space-y-2 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-text-main">{judge.judgeName}</p>
        <div className="flex items-center gap-2">
          {judge.recommendation && (
            <Badge variant="outline">{PITCHING_RECOMMENDATION_LABELS[judge.recommendation]}</Badge>
          )}
          {judge.level && (
            <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[judge.level]}>
              {PITCHING_LEVEL_LABELS[judge.level]}
            </Badge>
          )}
          <span className="text-sm font-semibold text-orange">
            {PITCHING_TEXT.totalOutOf(judge.totalScore ?? 0)}
          </span>
        </div>
      </div>

      {judge.minimumConditions && (
        <p
          className={
            judge.minimumConditions.passed ? 'text-xs text-score-green' : 'text-xs text-score-red'
          }
        >
          {judge.minimumConditions.passed
            ? PITCHING_TEXT.minimumPassed
            : PITCHING_TEXT.minimumFailed}
          {' · '}
          {PITCHING_TEXT.scoreCardLabel}: {judge.minimumConditions.scoreCardTotal ?? '—'}
          {' · '}
          {PITCHING_TEXT.participationLabel}: {judge.minimumConditions.participationPct ?? '—'}
        </p>
      )}

      <dl className="space-y-1.5">
        {PITCHING_COMMENT_FIELDS[round].map((field) => (
          <div key={field.key}>
            <dt className="text-xs font-medium text-muted-foreground">{field.label}</dt>
            <dd className="whitespace-pre-line text-sm text-text-main">
              {judge.comments[field.key] || PITCHING_TEXT.noComment}
            </dd>
          </div>
        ))}
        {judge.recommendationReason && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {PITCHING_TEXT.verdictReasonLabel}
            </dt>
            <dd className="whitespace-pre-line text-sm text-text-main">
              {judge.recommendationReason}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
