import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard-keys';

export function useIncubationProgress() {
  return useQuery({
    queryKey: dashboardKeys.incubationProgress(),
    queryFn: () => dashboardService.getIncubationProgress(),
  });
}
