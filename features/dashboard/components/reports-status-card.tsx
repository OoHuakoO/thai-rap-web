'use client';

import { Download } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { TableSkeleton } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  REPORT_FORMAT_DISPLAY,
  REPORT_STATUS_DISPLAY,
} from '../constants/dashboard-display.constants';
import { REPORTS_STATUS_TEXT } from '../constants/dashboard-text.constants';
import { useReportsStatus } from '../hooks/use-reports-status';
import { formatShortDataDate } from '../utils/format-data-date';
import { CardFooterLink } from './card-footer-link';

const SKELETON_ROWS = 4;
const COLUMN_COUNT = 5;

export function ReportsStatusCard() {
  const { data: reports, isLoading, isError, error } = useReportsStatus();

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">
          {REPORTS_STATUS_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {isLoading && <TableSkeleton rows={SKELETON_ROWS} cols={COLUMN_COUNT} />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap text-xs">
                  {REPORTS_STATUS_TEXT.nameColumn}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs">
                  {REPORTS_STATUS_TEXT.formatColumn}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs">
                  {REPORTS_STATUS_TEXT.createdAtColumn}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs">
                  {REPORTS_STATUS_TEXT.statusColumn}
                </TableHead>
                <TableHead className="whitespace-nowrap text-right text-xs">
                  {REPORTS_STATUS_TEXT.actionColumn}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.length ? (
                reports.map((report) => {
                  const format = REPORT_FORMAT_DISPLAY[report.format];
                  const status = REPORT_STATUS_DISPLAY[report.status];
                  const FormatIcon = format.icon;

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="whitespace-nowrap py-2 text-xs font-medium text-text-main">
                        {report.name}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-charcoal">
                          <FormatIcon className={cn('h-4 w-4 shrink-0', format.iconClass)} />
                          {format.label}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-xs text-charcoal">
                        {formatShortDataDate(report.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('font-medium', status.className)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild={!!report.downloadUrl}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-charcoal hover:text-orange"
                          disabled={!report.downloadUrl}
                          aria-label={REPORTS_STATUS_TEXT.downloadLabel(report.name)}
                        >
                          {report.downloadUrl ? (
                            <a href={report.downloadUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="py-10 text-center text-xs text-charcoal"
                  >
                    {REPORTS_STATUS_TEXT.empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <div className="mt-auto flex justify-end pt-1">
          <CardFooterLink href={ROUTES.REPORTS} label={REPORTS_STATUS_TEXT.footerLink} />
        </div>
      </CardContent>
    </Card>
  );
}
