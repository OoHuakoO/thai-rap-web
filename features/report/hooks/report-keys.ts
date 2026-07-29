import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type { RoundMatrixQueryParams } from '../types/report.types';

export const reportKeys = {
  all: ['reports'] as const,
  round: (storeId: string, round: AssessmentRound) => ['reports', 'round', storeId, round] as const,
  overview: (storeId: string) => ['reports', 'overview', storeId] as const,
  matrix: (round: AssessmentRound, params: RoundMatrixQueryParams = {}) =>
    ['reports', 'matrix', round, params] as const,
};
