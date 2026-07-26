import api from '@/services/api';
import type {
  ActivityItem,
  DashboardKPIs,
  DownloadedFile,
  IncubationStep,
  ProvinceComparison,
  ProvinceDistributionItem,
  ReportStatusItem,
  RoundPair,
  StoreRoundScores,
  Top20Entry,
  Top20RoundFilter,
} from '../types/dashboard.types';

const FILENAME_PATTERN = /filename="?([^";]+)"?/;

function parseFilename(contentDisposition: unknown): string | undefined {
  if (typeof contentDisposition !== 'string') return undefined;
  return FILENAME_PATTERN.exec(contentDisposition)?.[1];
}

export const dashboardService = {
  getKpis: () => api.get<DashboardKPIs>('/dashboard/kpis').then((res) => res.data),

  getProvinceDistribution: () =>
    api.get<ProvinceDistributionItem[]>('/dashboard/province-distribution').then((res) => res.data),

  getTop20: (round: Top20RoundFilter) =>
    api.get<Top20Entry[]>('/dashboard/top20', { params: { round } }).then((res) => res.data),

  getIncubationProgress: () =>
    api.get<IncubationStep[]>('/dashboard/incubation-progress').then((res) => res.data),

  getProvinceComparison: (pair: RoundPair) =>
    api
      .get<ProvinceComparison[]>('/dashboard/province-comparison', {
        params: { from: pair.from, to: pair.to },
      })
      .then((res) => res.data),

  getStoreRoundScores: () =>
    api.get<StoreRoundScores[]>('/dashboard/store-scores').then((res) => res.data),

  // Returns the header filename too: the server owns the format, so the mock
  // (CSV) and the real API (XLSX) can each name their own file.
  exportStoreRoundScores: (): Promise<DownloadedFile> =>
    api.get<Blob>('/dashboard/store-scores/export', { responseType: 'blob' }).then((res) => ({
      blob: res.data,
      filename: parseFilename(res.headers['content-disposition']),
    })),

  getActivities: () => api.get<ActivityItem[]>('/dashboard/activities').then((res) => res.data),

  getReportsStatus: () =>
    api.get<ReportStatusItem[]>('/dashboard/reports-status').then((res) => res.data),
};
