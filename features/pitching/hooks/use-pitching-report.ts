'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PITCHING_RANKING_PAGE_LIMIT,
  PITCHING_REPORT_PREFETCH_SIZE,
} from '../constants/pitching.constants';
import { pitchingService } from '../services/pitching.service';
import type { PitchingRankingRow, PitchingRound } from '../types/pitching.types';
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

/**
 * Warms the report of the cohort's first few stores as soon as the ranking
 * lands, so clicking a Top-10 row renders from cache instead of opening on a
 * skeleton. `prefetchQuery` writes into the same key `usePitchingStoreReport`
 * reads and no-ops while that entry is still fresh, so this never duplicates
 * the request the dashboard is already making for the selected store.
 */
export function usePrefetchTopStoreReports(
  rows: PitchingRankingRow[],
  round: PitchingRound,
  size = PITCHING_REPORT_PREFETCH_SIZE
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    for (const row of rows.slice(0, size)) {
      void queryClient.prefetchQuery({
        queryKey: pitchingKeys.storeReport(row.storeId, round),
        queryFn: () => pitchingService.getStoreReport(row.storeId, round),
      });
    }
  }, [rows, round, size, queryClient]);
}
