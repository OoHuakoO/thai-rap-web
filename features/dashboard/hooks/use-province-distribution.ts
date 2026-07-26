import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard-keys';

export function useProvinceDistribution() {
  return useQuery({
    queryKey: dashboardKeys.provinceDistribution(),
    queryFn: () => dashboardService.getProvinceDistribution(),
  });
}
