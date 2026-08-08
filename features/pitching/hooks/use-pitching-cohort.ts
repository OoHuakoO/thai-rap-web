'use client';

import { useQuery } from '@tanstack/react-query';
import { PITCHING_COHORT_LIMIT } from '../constants/pitching.constants';
import { pitchingService } from '../services/pitching.service';
import type { PitchingRound } from '../types/pitching.types';
import { pitchingKeys } from './pitching-keys';

/**
 * The round's whole ranking in a single page. The dashboard's Top 10 card and
 * its score-distribution donut are two readings of the same list — fetching it
 * once is what keeps them from disagreeing about the cohort.
 */
export function usePitchingCohort(round: PitchingRound) {
  return useQuery({
    queryKey: pitchingKeys.cohort(round),
    queryFn: () => pitchingService.getRanking(round, undefined, 1, PITCHING_COHORT_LIMIT),
  });
}
