'use client';

import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REPORT_TEXT } from '../constants/report.constants';
import type { ReportFileFormat } from '../types/report.types';

interface ReportDownloadButtonsProps {
  isExporting: boolean;
  disabled?: boolean;
  onDownload: (format: ReportFileFormat) => void;
}

export function ReportDownloadButtons({
  isExporting,
  disabled,
  onDownload,
}: ReportDownloadButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || isExporting}
        onClick={() => onDownload('xlsx')}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 text-score-green" />
        )}
        {REPORT_TEXT.downloadExcel}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || isExporting}
        onClick={() => onDownload('pdf')}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 text-score-red" />
        )}
        {REPORT_TEXT.downloadPdf}
      </Button>
    </div>
  );
}
