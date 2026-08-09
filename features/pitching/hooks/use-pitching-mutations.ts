'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pitchingService } from '../services/pitching.service';
import type { Pitching, PitchingRound, SubmitPitchingDto } from '../types/pitching.types';
import { pitchingKeys } from './pitching-keys';

// Submit answers with the whole form, so the cache is seeded from the response
// rather than invalidated — but the ranking and every store report shift the
// moment a form lands, and neither is derivable from this one response.
export function useSubmitPitching(id: string, storeId: string, round: PitchingRound) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitPitchingDto) => pitchingService.submit(id, data),
    onSuccess: (pitching: Pitching) => {
      queryClient.setQueryData(pitchingKeys.mine(storeId, round), pitching);
      queryClient.setQueryData(pitchingKeys.detail(pitching.id), pitching);
      queryClient.invalidateQueries({ queryKey: pitchingKeys.all });
    },
  });
}
