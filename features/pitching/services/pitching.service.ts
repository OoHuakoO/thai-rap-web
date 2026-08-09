import type { DownloadFormat } from '@/components/shared/download-buttons';
import type { DownloadedFile } from '@/features/dashboard';
import api from '@/services/api';
import type { PaginatedResponse } from '@/types/api.types';
import { parseFilename } from '@/utils/parse-filename';
import type {
  CreatePitchingDto,
  Pitching,
  PitchingRankingRow,
  PitchingRound,
  PitchingStoreReport,
  PitchingSummaryRow,
  SubmitPitchingDto,
} from '../types/pitching.types';

function toDownloadedFile(res: { data: Blob; headers: unknown }): DownloadedFile {
  const headers = res.headers as Record<string, unknown>;
  return { blob: res.data, filename: parseFilename(headers['content-disposition']) };
}

export const pitchingService = {
  // One form per (store, round, judge), so the caller's own row is the whole
  // page — the list is filtered down to it rather than scanned client-side.
  findMine: (storeId: string, round: PitchingRound, judgeId: string) =>
    api
      .get<PaginatedResponse<PitchingSummaryRow>>('/pitching', {
        params: { storeId, round, judgeId, limit: 1 },
      })
      .then((r) => r.data.items[0] ?? null),

  getById: (id: string) => api.get<Pitching>(`/pitching/${id}`).then((r) => r.data),

  getRanking: (round: PitchingRound, province?: string, page?: number, limit?: number) =>
    api
      .get<PaginatedResponse<PitchingRankingRow>>('/pitching/summary', {
        params: { round, province, page, limit },
      })
      .then((r) => r.data),

  // No page/limit: the API answers the whole round whatever is on screen.
  exportRanking: (round: PitchingRound, province: string | undefined, format: DownloadFormat) =>
    api
      .get<Blob>('/pitching/summary/export', {
        params: { round, province, format },
        responseType: 'blob',
      })
      .then(toDownloadedFile),

  getStoreReport: (storeId: string, round: PitchingRound) =>
    api
      .get<PitchingStoreReport>(`/pitching/stores/${storeId}`, { params: { round } })
      .then((r) => r.data),

  exportStoreReport: (storeId: string, round: PitchingRound, format: DownloadFormat) =>
    api
      .get<Blob>(`/pitching/stores/${storeId}/export`, {
        params: { round, format },
        responseType: 'blob',
      })
      .then(toDownloadedFile),

  create: (data: CreatePitchingDto) => api.post<Pitching>('/pitching', data).then((r) => r.data),

  // The only write the form makes: the whole form lands in one transaction.
  submit: (id: string, data: SubmitPitchingDto) =>
    api.post<Pitching>(`/pitching/${id}/submit`, data).then((r) => r.data),
};
