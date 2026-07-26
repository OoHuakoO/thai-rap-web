import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import type { RoundPair } from '../types/dashboard.types';
import { dashboardKeys } from './dashboard-keys';

export function useProvinceComparison(pair: RoundPair) {
  return useQuery({
    queryKey: dashboardKeys.provinceComparison(pair),
    queryFn: () => dashboardService.getProvinceComparison(pair),
  });
}
