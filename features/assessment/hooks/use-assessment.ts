import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentService, dimensionService } from '../services/assessment.service'
import type { Round, UpdateScoreDto } from '../types/assessment.types'

export const assessmentKeys = {
  all: ['assessments'] as const,
  byStore: (storeId: string) => ['assessments', 'by-store', storeId] as const,
  byStoreRound: (storeId: string, round: Round) => ['assessments', storeId, round] as const,
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
