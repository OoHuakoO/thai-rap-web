import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';

export const reportKeys = {
  all: ['reports'] as const,
  round: (storeId: string, round: AssessmentRound) =>
    ['reports', 'round', storeId, round] as const,
  overview: (storeId: string) => ['reports', 'overview', storeId] as const,
};
