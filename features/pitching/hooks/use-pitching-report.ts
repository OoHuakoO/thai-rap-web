'use client';

import { useQuery } from '@tanstack/react-query';
import { PITCHING_RANKING_PAGE_LIMIT } from '../constants/pitching.constants';
import { pitchingService } from '../services/pitching.service';
import type { PitchingRound } from '../types/pitching.types';
import { pitchingKeys } from './pitching-keys';

export function usePitchingRanking(
  round: PitchingRound,
  province?: string,
  page = 1,
  limit = PITCHING_RANKING_PAGE_LIMIT
) {
  return useQuery({
    queryKey: pitchingKeys.ranking(round, province, page, limit),
    queryFn: () => pitchingService.getRanking(round, province, page, limit),
  });
}

export function usePitchingStoreReport(storeId: string, round: PitchingRound) {
  return useQuery({
    queryKey: pitchingKeys.storeReport(storeId, round),
    queryFn: () => pitchingService.getStoreReport(storeId, round),
    enabled: Boolean(storeId),
  });
}
