import type { AnalyticsQueryParams } from '../types/analytics.types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  store: (storeId: string, params: AnalyticsQueryParams) =>
    ['analytics', storeId, params.compare, params.province ?? 'all'] as const,
};
