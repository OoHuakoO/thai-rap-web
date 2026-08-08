import type { PitchingRound } from '../types/pitching.types';

export const pitchingKeys = {
  all: ['pitching'] as const,
  detail: (id: string) => ['pitching', 'detail', id] as const,
  mine: (storeId: string, round: PitchingRound) => ['pitching', 'mine', storeId, round] as const,
  ranking: (round: PitchingRound, province: string | undefined, page: number, limit: number) =>
    ['pitching', 'ranking', round, province ?? null, page, limit] as const,
  cohort: (round: PitchingRound) => ['pitching', 'cohort', round] as const,
  storeReport: (storeId: string, round: PitchingRound) =>
    ['pitching', 'store-report', storeId, round] as const,
};
