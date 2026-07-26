import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { analyticsKeys } from './analytics-keys';
import type { AnalyticsQueryParams } from '../types/analytics.types';

export function useStoreAnalytics(storeId: string | undefined, params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.store(storeId ?? '', params),
    queryFn: () => analyticsService.getStoreAnalytics(storeId as string, params),
    enabled: Boolean(storeId),
  });
}
