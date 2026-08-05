import api from '@/services/api';
import { parseFilename } from '@/utils/parse-filename';
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

  // downloadUrl is an API route, not a link: the access token lives in memory,
  // so an <a href> would reach the endpoint unauthenticated. The server owns the
  // path — it came from the report row — and regenerates the file on request.
  downloadReport: (downloadUrl: string): Promise<DownloadedFile> =>
    api.get<Blob>(downloadUrl, { responseType: 'blob' }).then((res) => ({
      blob: res.data,
      filename: parseFilename(res.headers['content-disposition']),
    })),
};
