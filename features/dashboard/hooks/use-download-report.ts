import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadBlob } from '@/utils/download-blob';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { REPORTS_STATUS_TEXT } from '../constants/dashboard-text.constants';
import { dashboardService } from '../services/dashboard.service';

const FALLBACK_REPORT_FILENAME = 'report';

export function useDownloadReport() {
  return useMutation({
    mutationFn: (downloadUrl: string) => dashboardService.downloadReport(downloadUrl),
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename ?? FALLBACK_REPORT_FILENAME);
      toast.success(REPORTS_STATUS_TEXT.downloadSuccess);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
