import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard-keys';
import type { Top20RoundFilter } from '../types/dashboard.types';

export function useTop20(round: Top20RoundFilter) {
  return useQuery({
    queryKey: dashboardKeys.top20(round),
    queryFn: () => dashboardService.getTop20(round),
  });
}
