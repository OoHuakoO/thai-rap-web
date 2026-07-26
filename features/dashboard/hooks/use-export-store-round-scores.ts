import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { STORE_SCORES_DIALOG_TEXT } from '../constants/dashboard-text.constants';
import { dashboardService } from '../services/dashboard.service';
import { downloadBlob } from '@/utils/download-blob';

const FALLBACK_EXPORT_FILENAME = 'store-round-scores.xlsx';

export function useExportStoreRoundScores() {
  return useMutation({
    mutationFn: dashboardService.exportStoreRoundScores,
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename ?? FALLBACK_EXPORT_FILENAME);
      toast.success(STORE_SCORES_DIALOG_TEXT.downloadSuccess);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
