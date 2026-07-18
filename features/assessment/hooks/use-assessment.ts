'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentService, dimensionService } from '../services/assessment.service';
import type { Assessment, Round, UpdateScoreDto } from '../types/assessment.types';

export const assessmentKeys = {
  all: ['assessments'] as const,
  byStore: (storeId: string) => ['assessments', 'by-store', storeId] as const,
  byStoreRound: (storeId: string, round: Round) => ['assessments', storeId, round] as const,
  history: (storeId: string) => ['assessments', 'history', storeId] as const,
  rank: (storeId: string, round: Round) => ['assessments', 'rank', storeId, round] as const,
};

export const dimensionKeys = {
  all: ['dimensions'] as const,
};

export function useDimensions() {
  return useQuery({
    queryKey: dimensionKeys.all,
    queryFn: dimensionService.getAll,
    staleTime: Infinity, // seeded data — 8 dimensions never change at runtime
  });
}

export function useAssessmentSummaries(storeId: string) {
  return useQuery({
    queryKey: assessmentKeys.byStore(storeId),
    queryFn: () => assessmentService.findAllByStore(storeId),
    enabled: !!storeId,
  });
}

export function useAssessmentHistory(storeId: string) {
  return useQuery({
    queryKey: assessmentKeys.history(storeId),
    queryFn: () => assessmentService.getHistory(storeId),
    enabled: !!storeId,
  });
}

export function useAssessment(storeId: string, round: Round) {
  const queryClient = useQueryClient();

  // Read-only: finds the existing assessment, or null if none exists yet.
  const query = useQuery({
    queryKey: assessmentKeys.byStoreRound(storeId, round),
    queryFn: async () => {
      const existing = await assessmentService.findByStoreAndRound(storeId, round);
      return existing ? assessmentService.getById(existing.id) : null;
    },
    enabled: !!storeId && !!round,
  });

  // Creating a missing assessment is a write — it belongs in its own
  // mutation, not the queryFn above, so a query retry (default 3 attempts)
  // or React Strict Mode's double-invoke can never re-issue the POST and
  // create a duplicate assessment.
  const createMutation = useMutation({
    mutationFn: (vars: { storeId: string; round: Round }) => assessmentService.create(vars),
    onSuccess: (created, vars) => {
      queryClient.setQueryData<Assessment>(
        assessmentKeys.byStoreRound(vars.storeId, vars.round),
        created
      );
    },
  });

  // The mutation's own isIdle/isSuccess belongs to this hook instance, not
  // to one (storeId, round) pair — switching rounds without unmounting
  // (e.g. via RoundPills) reuses the same instance, so isIdle would stay
  // false forever after the first round's create succeeds and this effect
  // would never fire for the next round. Track the last key we attempted
  // ourselves instead of trusting mutation state across keys.
  const triedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${storeId}:${round}`;
    if (query.data === null && triedKeyRef.current !== key) {
      triedKeyRef.current = key;
      createMutation.mutate({ storeId, round });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, storeId, round]);

  const isCreating = query.data === null && !createMutation.isError;

  return {
    data: query.data ?? undefined,
    isLoading: query.isLoading || isCreating,
    isError: query.isError || createMutation.isError,
    error: query.error ?? createMutation.error,
  };
}

export function useUpdateScore(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, ...data }: UpdateScoreDto & { questionId: number }) =>
      assessmentService.updateScore(assessmentId, questionId, data),
    // The PUT response is the saved question — patch it into the cached
    // assessment instead of refetching all 50 questions after every save.
    onSuccess: (updated) => {
      queryClient.setQueryData<Assessment>(
        assessmentKeys.byStoreRound(storeId, round),
        (prev) =>
          prev && {
            ...prev,
            questions: prev.questions.map((q) =>
              q.questionId === updated.questionId ? { ...q, ...updated } : q
            ),
          }
      );
    },
  });
}

export function useUploadEvidence(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, file }: { questionId: number; file: File }) =>
      assessmentService.uploadEvidence(assessmentId, questionId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) });
    },
  });
}

export function useDeleteEvidence(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evidenceId: string) => assessmentService.deleteEvidence(assessmentId, evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) });
    },
  });
}

export function useSubmitAssessment(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assessmentService.submit(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStore(storeId) });
    },
  });
}

export function useUpdateNotes(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes: string) => assessmentService.updateNotes(assessmentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) });
    },
  });
}

export function useAssessmentRank(storeId: string, round: Round) {
  return useQuery({
    queryKey: assessmentKeys.rank(storeId, round),
    queryFn: () => assessmentService.getRank(storeId, round),
    enabled: !!storeId && !!round,
  });
}
