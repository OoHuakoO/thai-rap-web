import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard-keys';

export function useReportsStatus() {
  return useQuery({
    queryKey: dashboardKeys.reportsStatus(),
    queryFn: () => dashboardService.getReportsStatus(),
  });
}
