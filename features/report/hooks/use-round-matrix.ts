import { useQuery } from '@tanstack/react-query';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import { reportService } from '../services/report.service';
import { reportKeys } from './report-keys';

export function useRoundMatrix(round: AssessmentRound) {
  return useQuery({
    queryKey: reportKeys.matrix(round),
    queryFn: () => reportService.getRoundMatrix(round),
  });
}
