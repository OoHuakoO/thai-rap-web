import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard-keys';

export function useStoreRoundScores(enabled: boolean) {
  return useQuery({
    queryKey: dashboardKeys.storeRoundScores(),
    queryFn: dashboardService.getStoreRoundScores,
    enabled,
  });
}
