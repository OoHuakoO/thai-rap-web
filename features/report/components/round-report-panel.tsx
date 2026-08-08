'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { DownloadButtons } from '@/components/shared/download-buttons';
import { CardSkeleton } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AssessmentRound } from '@/features/dashboard';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDate } from '@/utils/format-thai-date';
import { useAuthStore } from '@/stores/auth-store';
import { REPORT_DETAIL_ROLES, REPORT_TEXT, ZONE_BADGE_CLASS } from '../constants/report.constants';
import { useExportRoundReport } from '../hooks/use-export-report';
import { useRoundReport } from '../hooks/use-round-report';
import type { ReportFileFormat } from '../types/report.types';

import { RoundQuestionDetail } from './round-question-detail';

interface RoundReportPanelProps {
  storeId: string;
  round: AssessmentRound;
}

export function RoundReportPanel({ storeId, round }: RoundReportPanelProps) {
  const { data: report, isLoading, isError, error } = useRoundReport(storeId, round);
  const { mutate: exportReport, isPending: isExporting } = useExportRoundReport();
  // The weighting breakdown and the 50-question detail are admin-only; every
  // other role keeps the summary this panel has always shown.
  const showDetail = useAuthStore((state) => state.hasRole)(REPORT_DETAIL_ROLES);

  const handleDownload = (format: ReportFileFormat) => exportReport({ storeId, round, format });

  if (isLoading) return <CardSkeleton />;
  // A missing round answers 404, which reads as "not assessed yet" here rather
  // than an error the user can act on.
  if (isError) {
    const message = extractErrorMessage(error);
    return <AlertCard variant="info" message={message || REPORT_TEXT.noRoundData} />;
  }
  if (!report) return <AlertCard variant="info" message={REPORT_TEXT.noRoundData} />;

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{report.store.name}</CardTitle>
          <DownloadButtons
            isExporting={isExporting}
            excelLabel={REPORT_TEXT.downloadExcel}
            pdfLabel={REPORT_TEXT.downloadPdf}
            onDownload={handleDownload}
          />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ReportField label={REPORT_TEXT.totalScore} value={formatScore(report.totalScore)} />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-text-main">{REPORT_TEXT.zone}</span>
            {report.zone ? (
              <Badge variant="outline" className={cn(ZONE_BADGE_CLASS[report.zone])}>
                {report.zone}
              </Badge>
            ) : (
              <span className="text-charcoal">{REPORT_TEXT.noData}</span>
            )}
          </div>
          {showDetail && (
            <>
              <ReportField
                label={REPORT_TEXT.rawScoreColumn}
                value={`${report.rawScore} / ${report.maxScore}`}
              />
              <ReportField
                label={REPORT_TEXT.rawScorePctLabel}
                value={`${report.rawScorePct.toFixed(2)}%`}
              />
              <ReportField
                label={REPORT_TEXT.completionLabel}
                value={`${report.completionPct.toFixed(2)}%`}
              />
            </>
          )}
          <ReportField label={REPORT_TEXT.assessor} value={report.assessorName} />
          <ReportField
            label={REPORT_TEXT.submittedAt}
            value={report.submittedAt ? formatThaiDate(report.submittedAt) : REPORT_TEXT.noData}
          />
          {report.notes && <ReportField label={REPORT_TEXT.notes} value={report.notes} />}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {showDetail ? REPORT_TEXT.dimensionSection : REPORT_TEXT.dimensionSectionBasic}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{REPORT_TEXT.dimensionColumn}</TableHead>
                {showDetail && (
                  <>
                    <TableHead className="text-right">{REPORT_TEXT.rawScoreColumn}</TableHead>
                    <TableHead className="text-right">{REPORT_TEXT.maxScoreColumn}</TableHead>
                  </>
                )}
                <TableHead className="text-right">{REPORT_TEXT.scoreColumn}</TableHead>
                <TableHead className="text-right">{REPORT_TEXT.weightColumn}</TableHead>
                {showDetail && (
                  <TableHead className="text-right">{REPORT_TEXT.weightedScoreColumn}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.dimensions.map((dimension) => (
                <TableRow key={dimension.dimensionId}>
                  <TableCell>{dimension.dimensionName}</TableCell>
                  {showDetail && (
                    <>
                      <TableCell className="text-right tabular-nums">
                        {dimension.rawScore}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {dimension.maxScore}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right tabular-nums">
                    {dimension.scorePct.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{dimension.weight}</TableCell>
                  {showDetail && (
                    <TableCell className="text-right tabular-nums">
                      {dimension.weightedScore.toFixed(2)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {showDetail && (
                <TableRow className="font-medium">
                  <TableCell>{REPORT_TEXT.grandTotalRow}</TableCell>
                  <TableCell className="text-right tabular-nums">{report.rawScore}</TableCell>
                  <TableCell className="text-right tabular-nums">{report.maxScore}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {report.rawScorePct.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">100</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatScore(report.totalScore)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showDetail && <RoundQuestionDetail dimensions={report.dimensions} />}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{REPORT_TEXT.redFlagSection}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {report.redFlags.length === 0 ? (
            <AlertCard variant="info" message={REPORT_TEXT.noRedFlag} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{REPORT_TEXT.redFlagTypeColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.redFlagSeverityColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.redFlagStatusColumn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.redFlags.map((flag) => (
                  <TableRow key={`${flag.type}-${flag.triggerQuestions.join('-')}`}>
                    <TableCell>{flag.type}</TableCell>
                    <TableCell>{flag.severity}</TableCell>
                    <TableCell>
                      {flag.resolved ? REPORT_TEXT.redFlagResolved : REPORT_TEXT.redFlagUnresolved}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatScore(value: number | null): string {
  return value === null ? REPORT_TEXT.noData : value.toFixed(2);
}

function ReportField({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="font-medium text-text-main">{label}</span>{' '}
      <span className="text-charcoal">{value}</span>
    </p>
  );
}
