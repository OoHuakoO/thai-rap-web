'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { pitchingService } from '../services/pitching.service';
import type { Pitching, PitchingRound } from '../types/pitching.types';
import { pitchingKeys } from './pitching-keys';

/**
 * The caller's own form for a (store, round), or null when they have not
 * started one. Deliberately does not auto-create: a judge opening the picker to
 * look around would otherwise leave an empty draft on every store they browsed.
 */
export function useMyPitching(storeId: string, round: PitchingRound) {
  const judgeId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: pitchingKeys.mine(storeId, round),
    queryFn: async (): Promise<Pitching | null> => {
      if (!judgeId) return null;
      const existing = await pitchingService.findMine(storeId, round, judgeId);
      return existing ? pitchingService.getById(existing.id) : null;
    },
    enabled: Boolean(storeId && judgeId),
  });
}

export function useCreatePitching(storeId: string, round: PitchingRound) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pitchingService.create({ storeId, round }),
    onSuccess: (pitching) => {
      queryClient.setQueryData(pitchingKeys.mine(storeId, round), pitching);
      queryClient.setQueryData(pitchingKeys.detail(pitching.id), pitching);
    },
  });
}
