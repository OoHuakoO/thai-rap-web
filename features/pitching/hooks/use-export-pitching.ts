'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DownloadFormat } from '@/components/shared/download-buttons';
import { downloadBlob } from '@/utils/download-blob';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { PITCHING_TEXT } from '../constants/pitching.constants';
import { pitchingService } from '../services/pitching.service';
import type { PitchingRound } from '../types/pitching.types';

const FALLBACK_FILENAME = (format: DownloadFormat) => `pitching-report.${format}`;

interface ExportRankingInput {
  round: PitchingRound;
  province?: string;
  format: DownloadFormat;
}

interface ExportStoreReportInput {
  storeId: string;
  round: PitchingRound;
  format: DownloadFormat;
}

export function useExportPitchingRanking() {
  return useMutation({
    mutationFn: ({ round, province, format }: ExportRankingInput) =>
      pitchingService.exportRanking(round, province, format).then((file) => ({ ...file, format })),
    onSuccess: ({ blob, filename, format }) => {
      downloadBlob(blob, filename ?? FALLBACK_FILENAME(format));
      toast.success(PITCHING_TEXT.downloadSuccess);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useExportPitchingStoreReport() {
  return useMutation({
    mutationFn: ({ storeId, round, format }: ExportStoreReportInput) =>
      pitchingService
        .exportStoreReport(storeId, round, format)
        .then((file) => ({ ...file, format })),
    onSuccess: ({ blob, filename, format }) => {
      downloadBlob(blob, filename ?? FALLBACK_FILENAME(format));
      toast.success(PITCHING_TEXT.downloadSuccess);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
