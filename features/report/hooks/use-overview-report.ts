import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/report.service';
import { reportKeys } from './report-keys';

export function useOverviewReport(storeId: string) {
  return useQuery({
    queryKey: reportKeys.overview(storeId),
    queryFn: () => reportService.getOverviewReport(storeId),
    enabled: Boolean(storeId),
  });
}
