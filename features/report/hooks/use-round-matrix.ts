import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AssessmentRound } from '@/features/dashboard';
import { reportService } from '../services/report.service';
import type { RoundMatrixQueryParams } from '../types/report.types';
import { reportKeys } from './report-keys';

export function useRoundMatrix(round: AssessmentRound, params: RoundMatrixQueryParams = {}) {
  return useQuery({
    queryKey: reportKeys.matrix(round, params),
    queryFn: () => reportService.getRoundMatrix(round, params),
    // The table runs to forty columns; blanking it back to a skeleton on every
    // page change loses the reader's place in it.
    placeholderData: keepPreviousData,
  });
}
