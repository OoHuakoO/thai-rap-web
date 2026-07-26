import api from '@/services/api';
import type {
  ActionPlan,
  AnalyticsQueryParams,
  DownloadedFile,
  RadarChartData,
  StoreAnalytics,
  TrendData,
} from '../types/analytics.types';

const FILENAME_PATTERN = /filename="?([^";]+)"?/;

function parseFilename(contentDisposition: unknown): string | undefined {
  if (typeof contentDisposition !== 'string') return undefined;
  return FILENAME_PATTERN.exec(contentDisposition)?.[1];
}

export const analyticsService = {
  getStoreAnalytics: (storeId: string, params: AnalyticsQueryParams) =>
    api.get<StoreAnalytics>(`/analytics/${storeId}`, { params }).then((res) => res.data),

  getRadar: (storeId: string) =>
    api.get<RadarChartData>(`/analytics/${storeId}/radar`).then((res) => res.data),

  getTrend: (storeId: string) =>
    api.get<TrendData>(`/analytics/${storeId}/trend`).then((res) => res.data),

  getActionPlans: (storeId: string) =>
    api.get<ActionPlan[]>(`/analytics/${storeId}/action-plans`).then((res) => res.data),

  // Filename comes back in the header because the server owns the format —
  // the mock ships CSV while the real API ships XLSX, same as the dashboard
  // store-scores export.
  exportAnalytics: (storeId: string, params: AnalyticsQueryParams): Promise<DownloadedFile> =>
    api.get<Blob>(`/analytics/${storeId}/export`, { params, responseType: 'blob' }).then((res) => ({
      blob: res.data,
      filename: parseFilename(res.headers['content-disposition']),
    })),
};
