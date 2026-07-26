import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { analyticsKeys } from './analytics-keys';

export function useActionPlans(storeId: string | undefined) {
  return useQuery({
    queryKey: analyticsKeys.actionPlans(storeId ?? ''),
    queryFn: () => analyticsService.getActionPlans(storeId as string),
    enabled: Boolean(storeId),
  });
}
