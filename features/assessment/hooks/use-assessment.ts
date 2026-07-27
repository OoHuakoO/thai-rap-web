'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME_MS } from '@/constants';
import { storeKeys } from '@/features/store';
import { assessmentService, dimensionService } from '../services/assessment.service';
import { calcWeightedTotal } from '../utils/dimension-score';
import type { Assessment, Dimension, Round, UpdateScoreDto } from '../types/assessment.types';

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

/**
 * Read-only counterpart to useAssessment: reads an existing assessment for a
 * round and resolves to null when there is none, instead of creating one. Uses
 * the same cache key, so reading the round that's already open in the form
 * costs no extra request.
 */
export function useAssessmentByRound(
  storeId: string,
  round: Round,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: assessmentKeys.byStoreRound(storeId, round),
    queryFn: async () => {
      const existing = await assessmentService.findByStoreAndRound(storeId, round);
      return existing ? assessmentService.getById(existing.id) : null;
    },
    enabled: !!storeId && !!round && (options?.enabled ?? true),
  });
}

export function useAssessment(
  storeId: string,
  round: Round,
  options?: { enabled?: boolean; canCreate?: boolean }
) {
  const enabled = options?.enabled ?? true;
  // Opening a round creates it — that is a write, and a read-only role (an
  // entrepreneur or ME team viewing their own store) must not fire it. The API
  // answers 403, which the axios interceptor turns into a hard redirect to
  // /403, so an ungated auto-create locks those roles out of the page entirely.
  const canCreate = options?.canCreate ?? true;
  const queryClient = useQueryClient();

  // Read-only: finds the existing assessment, or null if none exists yet.
  const query = useQuery({
    queryKey: assessmentKeys.byStoreRound(storeId, round),
    queryFn: async () => {
      const existing = await assessmentService.findByStoreAndRound(storeId, round);
      return existing ? assessmentService.getById(existing.id) : null;
    },
    enabled: !!storeId && !!round && enabled,
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
    if (!enabled || !canCreate) return;
    const key = `${storeId}:${round}`;
    if (query.data === null && triedKeyRef.current !== key) {
      triedKeyRef.current = key;
      createMutation.mutate({ storeId, round });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, storeId, round, enabled, canCreate]);

  const isCreating = canCreate && query.data === null && !createMutation.isError;

  // Lets the caller recover from a failed auto-create without a full page
  // reload — triedKeyRef would otherwise permanently block a retry for this
  // (storeId, round) pair since the effect above only fires on a data change.
  const retry = () => {
    if (createMutation.isError) {
      triedKeyRef.current = `${storeId}:${round}`;
      createMutation.mutate({ storeId, round });
    } else {
      query.refetch();
    }
  };

  return {
    data: query.data ?? undefined,
    isLoading: query.isLoading || isCreating,
    isError: query.isError || createMutation.isError,
    error: query.error ?? createMutation.error,
    /** The round has no assessment yet and this viewer may not start one. */
    isMissing: !canCreate && query.data === null,
    retry,
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
      queryClient.setQueryData<Assessment>(assessmentKeys.byStoreRound(storeId, round), (prev) => {
        if (!prev) return prev;
        const questions = prev.questions.map((q) =>
          q.questionId === updated.questionId ? { ...q, ...updated } : q
        );
        // The response carries no score roll-up, so the running total is
        // recomputed here. Dimensions are cached for the session once the form
        // loads; on the off chance they aren't, the stored value simply stands
        // until this assessment is fetched again.
        const dimensions = queryClient.getQueryData<Dimension[]>(dimensionKeys.all);
        return {
          ...prev,
          questions,
          currentScore: dimensions ? calcWeightedTotal(questions, dimensions) : prev.currentScore,
        };
      });
      // Score save also reassigns the assessor on the backend — history
      // (assessorName/updatedAt on the timeline card) must refetch too.
      queryClient.invalidateQueries({ queryKey: assessmentKeys.history(storeId) });
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

export function useSaveDraft(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assessmentService.saveDraft(assessmentId),
    onSuccess: (updated) => {
      queryClient.setQueryData<Assessment>(assessmentKeys.byStoreRound(storeId, round), updated);
      // The round card in TimelineArea and the round pills both read status
      // off their own caches — a draft save flips DRAFT → IN_PROGRESS.
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStore(storeId) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.history(storeId) });
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
      // Submission can advance Store.status (e.g. T0_COMPLETED) and shifts
      // this store's rank among others — both live in caches this mutation
      // doesn't otherwise touch.
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.rank(storeId, round) });
      // TimelineArea's round-history card reads this key — without it, the
      // just-submitted round keeps showing its pre-submit status/timestamp.
      queryClient.invalidateQueries({ queryKey: assessmentKeys.history(storeId) });
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
    // Ranks only move when some store submits a round, and this store's own
    // submit already invalidates the key. Without a stale time the summary card
    // re-runs the cohort aggregate on every remount — switching dimensions,
    // reopening the form, flipping the round picker back and forth.
    staleTime: QUERY_STALE_TIME_MS,
  });
}
