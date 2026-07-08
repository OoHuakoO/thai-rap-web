import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentService, dimensionService } from '../services/assessment.service'
import type { Round, UpdateScoreDto } from '../types/assessment.types'

export const assessmentKeys = {
  all: ['assessments'] as const,
  byStore: (storeId: string) => ['assessments', 'by-store', storeId] as const,
  byStoreRound: (storeId: string, round: Round) => ['assessments', storeId, round] as const,
  rank: (storeId: string, round: Round) => ['assessments', 'rank', storeId, round] as const,
}

export const dimensionKeys = {
  all: ['dimensions'] as const,
}

export function useDimensions() {
  return useQuery({
    queryKey: dimensionKeys.all,
    queryFn: dimensionService.getAll,
    staleTime: Infinity, // seeded data — 8 dimensions never change at runtime
  })
}

export function useAssessmentSummaries(storeId: string) {
  return useQuery({
    queryKey: assessmentKeys.byStore(storeId),
    queryFn: () => assessmentService.findAllByStore(storeId),
    enabled: !!storeId,
  })
}

export function useAssessment(storeId: string, round: Round) {
  return useQuery({
    queryKey: assessmentKeys.byStoreRound(storeId, round),
    queryFn: async () => {
      const existing = await assessmentService.findByStoreAndRound(storeId, round)
      if (existing) return assessmentService.getById(existing.id)
      return assessmentService.create({ storeId, round })
    },
    enabled: !!storeId && !!round,
  })
}

export function useUpdateScore(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, ...data }: UpdateScoreDto & { questionId: number }) =>
      assessmentService.updateScore(assessmentId, questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
    },
  })
}

export function useUploadEvidence(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, file }: { questionId: number; file: File }) =>
      assessmentService.uploadEvidence(assessmentId, questionId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
    },
  })
}

export function useDeleteEvidence(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (evidenceId: string) => assessmentService.deleteEvidence(assessmentId, evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
    },
  })
}

export function useSubmitAssessment(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => assessmentService.submit(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStore(storeId) })
    },
  })
}

export function useUpdateNotes(storeId: string, round: Round, assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notes: string) => assessmentService.updateNotes(assessmentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
    },
  })
}

export function useAssessmentRank(storeId: string, round: Round) {
  return useQuery({
    queryKey: assessmentKeys.rank(storeId, round),
    queryFn: () => assessmentService.getRank(storeId, round),
    enabled: !!storeId && !!round,
  })
}
