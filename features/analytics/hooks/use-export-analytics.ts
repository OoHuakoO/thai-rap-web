import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadBlob } from '@/utils/download-blob';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ANALYTICS_TOOLBAR_TEXT } from '../constants/analytics-text.constants';
import { analyticsService } from '../services/analytics.service';
import type { AnalyticsQueryParams } from '../types/analytics.types';

const FALLBACK_EXPORT_FILENAME = 'store-analytics.xlsx';

interface ExportAnalyticsVariables {
  storeId: string;
  params: AnalyticsQueryParams;
}

export function useExportAnalytics() {
  return useMutation({
    mutationFn: ({ storeId, params }: ExportAnalyticsVariables) =>
      analyticsService.exportAnalytics(storeId, params),
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename ?? FALLBACK_EXPORT_FILENAME);
      toast.success(ANALYTICS_TOOLBAR_TEXT.exportSuccess);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
