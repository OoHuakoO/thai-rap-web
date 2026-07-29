'use client';

import { AlertCard } from '@/components/shared/alert-card';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { OVERALL_LEVEL_BADGE_CLASS, REPORT_TEXT } from '../constants/report.constants';
import { useExportRoundMatrix } from '../hooks/use-export-report';
import { useRoundMatrix } from '../hooks/use-round-matrix';
import type { ReportFileFormat } from '../types/report.types';
import { ReportDownloadButtons } from './report-download-buttons';

interface RoundMatrixPanelProps {
  round: AssessmentRound;
}

/** Every accessible store's dimension scores for one round — 03_สรุปคะแนน on screen. */
export function RoundMatrixPanel({ round }: RoundMatrixPanelProps) {
  const { data: report, isLoading, isError, error } = useRoundMatrix(round);
  const { mutate: exportReport, isPending: isExporting } = useExportRoundMatrix();

  const handleDownload = (format: ReportFileFormat) => exportReport({ round, format });

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!report) return <AlertCard variant="info" message={REPORT_TEXT.matrixEmpty} />;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">{REPORT_TEXT.matrixSection(report.round)}</CardTitle>
          <p className="text-xs text-charcoal">
            {REPORT_TEXT.matrixStoreCount(report.rows.length)}
          </p>
        </div>
        <ReportDownloadButtons
          isExporting={isExporting}
          disabled={report.rows.length === 0}
          onDownload={handleDownload}
        />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {report.rows.length === 0 ? (
          <AlertCard variant="info" message={REPORT_TEXT.matrixEmpty} />
        ) : (
          <TooltipProvider delayDuration={100}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{REPORT_TEXT.storeCodeColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.storeNameColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.provinceColumn}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.completionLabel}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.rawScoreColumn}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.rawScorePctLabel}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.weightedScoreColumn}</TableHead>
                  <TableHead className="text-right">{REPORT_TEXT.redFlagColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.overallLevelColumn}</TableHead>
                  <TableHead>{REPORT_TEXT.criticalDimensionColumn}</TableHead>
                  {report.dimensions.map((dimension) => (
                    <TableHead key={dimension.dimensionId} className="whitespace-nowrap text-right">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4">
                          {REPORT_TEXT.dimensionShortLabel(dimension.dimensionId, dimension.weight)}
                        </TooltipTrigger>
                        <TooltipContent>{dimension.dimensionName}</TooltipContent>
                      </Tooltip>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.storeId}>
                    <TableCell className="font-medium tabular-nums">{row.storeCode}</TableCell>
                    <TableCell>{row.storeName}</TableCell>
                    <TableCell>{row.province}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.completionPct.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.rawScore}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.rawScorePct.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatScore(row.weightedScore)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.redFlagCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'whitespace-nowrap',
                          OVERALL_LEVEL_BADGE_CLASS[row.overallLevel]
                        )}
                      >
                        {row.overallLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.criticalDimensionId === null ? (
                        REPORT_TEXT.noData
                      ) : (
                        <Tooltip>
                          <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4">
                            {REPORT_TEXT.dimensionNumberLabel(row.criticalDimensionId)}
                          </TooltipTrigger>
                          <TooltipContent>{row.criticalDimensionName}</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    {report.dimensions.map((dimension) => (
                      <TableCell key={dimension.dimensionId} className="text-right tabular-nums">
                        {formatScore(row.scoresByDimension[dimension.dimensionId] ?? null)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell />
                  <TableCell>{REPORT_TEXT.averageRow}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="text-right tabular-nums">
                    {formatScore(report.averageWeightedScore)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  {report.dimensions.map((dimension) => (
                    <TableCell key={dimension.dimensionId} className="text-right tabular-nums">
                      {formatScore(report.averageByDimension[dimension.dimensionId] ?? null)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}

function formatScore(value: number | null): string {
  return value === null ? REPORT_TEXT.noData : value.toFixed(2);
}
