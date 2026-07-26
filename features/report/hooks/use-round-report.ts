import { useQuery } from '@tanstack/react-query';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import { reportService } from '../services/report.service';
import { reportKeys } from './report-keys';

export function useRoundReport(storeId: string, round: AssessmentRound) {
  return useQuery({
    queryKey: reportKeys.round(storeId, round),
    queryFn: () => reportService.getRoundReport(storeId, round),
    enabled: Boolean(storeId),
    // A round the store hasn't sat yet answers 404 — retrying can't change that.
    retry: false,
  });
}
