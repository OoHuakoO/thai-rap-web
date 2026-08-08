'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pitchingService } from '../services/pitching.service';
import type {
  Pitching,
  PitchingRound,
  UpdatePitchingDto,
  UpdatePitchingScoreDto,
} from '../types/pitching.types';
import { pitchingKeys } from './pitching-keys';

// Every write answers with the whole form, so the cache is seeded from the
// response rather than invalidated — a score keystroke must not refetch the
// form the judge is still typing into.
function useWriteCache(storeId: string, round: PitchingRound) {
  const queryClient = useQueryClient();

  return (pitching: Pitching, alsoInvalidateReports = false) => {
    queryClient.setQueryData(pitchingKeys.mine(storeId, round), pitching);
    queryClient.setQueryData(pitchingKeys.detail(pitching.id), pitching);
    if (alsoInvalidateReports) {
      queryClient.invalidateQueries({ queryKey: pitchingKeys.all });
    }
  };
}

export function useUpdatePitching(id: string, storeId: string, round: PitchingRound) {
  const writeCache = useWriteCache(storeId, round);

  return useMutation({
    mutationFn: (data: UpdatePitchingDto) => pitchingService.update(id, data),
    onSuccess: (pitching) => writeCache(pitching),
  });
}

export function useUpdatePitchingScore(id: string, storeId: string, round: PitchingRound) {
  const writeCache = useWriteCache(storeId, round);

  return useMutation({
    mutationFn: ({ criterionId, ...data }: UpdatePitchingScoreDto & { criterionId: number }) =>
      pitchingService.updateScore(id, criterionId, data),
    onSuccess: (pitching) => writeCache(pitching),
  });
}

export function useSubmitPitching(id: string, storeId: string, round: PitchingRound) {
  const writeCache = useWriteCache(storeId, round);

  return useMutation({
    mutationFn: () => pitchingService.submit(id),
    // The ranking and every store report shift the moment a form lands, and
    // neither is derivable from this one response.
    onSuccess: (pitching) => writeCache(pitching, true),
  });
}
