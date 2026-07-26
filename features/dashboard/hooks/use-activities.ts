import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard-keys';

export function useActivities() {
  return useQuery({
    queryKey: dashboardKeys.activities(),
    queryFn: () => dashboardService.getActivities(),
  });
}
