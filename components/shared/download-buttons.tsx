'use client';

import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** The two formats every export route on the API accepts. */
export type DownloadFormat = 'xlsx' | 'pdf';

interface DownloadButtonsProps {
  isExporting: boolean;
  disabled?: boolean;
  // Labels are props, not constants in this file: the copy belongs to whichever
  // feature owns the download, per .claude/rules/text-constants.md. Only the
  // mechanics are shared.
  excelLabel: string;
  pdfLabel: string;
  onDownload: (format: DownloadFormat) => void;
}

export function DownloadButtons({
  isExporting,
  disabled,
  excelLabel,
  pdfLabel,
  onDownload,
}: DownloadButtonsProps) {
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
        {excelLabel}
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
        {pdfLabel}
      </Button>
    </div>
  );
}
