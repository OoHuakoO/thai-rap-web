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
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDate } from '@/utils/format-thai-date';
import { REPORT_ROUNDS, REPORT_TEXT, ZONE_BADGE_CLASS } from '../constants/report.constants';
import { useExportOverviewReport } from '../hooks/use-export-report';
import { useOverviewReport } from '../hooks/use-overview-report';
import type { ReportFileFormat } from '../types/report.types';

interface OverviewReportPanelProps {
  storeId: string;
}

export function OverviewReportPanel({ storeId }: OverviewReportPanelProps) {
  const { data: report, isLoading, isError, error } = useOverviewReport(storeId);
  const { mutate: exportReport, isPending: isExporting } = useExportOverviewReport();

  const handleDownload = (format: ReportFileFormat) => exportReport({ storeId, format });

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!report) return <AlertCard variant="info" message={REPORT_TEXT.noRounds} />;

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{report.store.name}</CardTitle>
            <p className="text-xs text-charcoal">
              {REPORT_TEXT.unresolvedFlags(report.unresolvedRedFlagCount)}
            </p>
          </div>
          <DownloadButtons
            excelLabel={REPORT_TEXT.downloadExcel}
            pdfLabel={REPORT_TEXT.downloadPdf}
            isExporting={isExporting}
            disabled={report.rounds.length === 0}
            onDownload={handleDownload}
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {report.rounds.length === 0 ? (
            <AlertCard variant="info" message={REPORT_TEXT.noRounds} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{REPORT_TEXT.roundColumn}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.totalScore}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.deltaColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.zone}</TableHead>
                  <TableHead>{REPORT_TEXT.submittedAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rounds.map((item) => (
                  <TableRow key={item.round}>
                    <TableCell className="font-medium">{item.round}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatScore(item.totalScore)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right tabular-nums',
                        item.delta !== null && item.delta > 0 && 'text-score-green',
                        item.delta !== null && item.delta < 0 && 'text-score-red'
                      )}
                    >
                      {formatDelta(item.delta)}
                    </TableCell>
                    <TableCell>
                      {item.zone ? (
                        <Badge variant="outline" className={cn(ZONE_BADGE_CLASS[item.zone])}>
                          {item.zone}
                        </Badge>
                      ) : (
                        REPORT_TEXT.noData
                      )}
                    </TableCell>
                    <TableCell>
                      {item.submittedAt ? formatThaiDate(item.submittedAt) : REPORT_TEXT.noData}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{REPORT_TEXT.trendSection}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{REPORT_TEXT.dimensionColumn}</TableHead>
                <TableHead className="text-right">{REPORT_TEXT.weightColumn}</TableHead>
                {REPORT_ROUNDS.map((round) => (
                  <TableHead key={round} className="text-right">
                    {round}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.dimensionTrends.map((trend) => (
                <TableRow key={trend.dimensionId}>
                  <TableCell>{trend.dimensionName}</TableCell>
                  <TableCell className="text-right tabular-nums">{trend.weight}</TableCell>
                  {REPORT_ROUNDS.map((round) => (
                    <TableCell key={round} className="text-right tabular-nums">
                      {formatScore(trend.scoresByRound[round] ?? null)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatScore(value: number | null): string {
  return value === null ? REPORT_TEXT.noData : value.toFixed(2);
}

function formatDelta(value: number | null): string {
  if (value === null) return REPORT_TEXT.noData;
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}
