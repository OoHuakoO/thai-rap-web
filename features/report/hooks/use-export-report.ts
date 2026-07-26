import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import { downloadBlob } from '@/utils/download-blob';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { REPORT_TEXT } from '../constants/report.constants';
import { reportService } from '../services/report.service';
import type { ReportFileFormat } from '../types/report.types';

interface ExportRoundInput {
  storeId: string;
  round: AssessmentRound;
  format: ReportFileFormat;
}

interface ExportOverviewInput {
  storeId: string;
  format: ReportFileFormat;
}

const FALLBACK_FILENAME = (format: ReportFileFormat) => `assessment-report.${format}`;

export function useExportRoundReport() {
  return useMutation({
    mutationFn: ({ storeId, round, format }: ExportRoundInput) =>
      reportService.exportRoundReport(storeId, round, format).then((file) => ({ ...file, format })),
    onSuccess: ({ blob, filename, format }) => {
      downloadBlob(blob, filename ?? FALLBACK_FILENAME(format));
      toast.success(REPORT_TEXT.downloadSuccess);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useExportOverviewReport() {
  return useMutation({
    mutationFn: ({ storeId, format }: ExportOverviewInput) =>
      reportService.exportOverviewReport(storeId, format).then((file) => ({ ...file, format })),
    onSuccess: ({ blob, filename, format }) => {
      downloadBlob(blob, filename ?? FALLBACK_FILENAME(format));
      toast.success(REPORT_TEXT.downloadSuccess);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
