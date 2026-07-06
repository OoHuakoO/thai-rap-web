import api from '@/services/api'
import type { PaginatedResponse } from '@/types/api.types'
import type {
  Assessment,
  AssessmentSummary,
  AssessmentQuestion,
  CreateAssessmentDto,
  UpdateScoreDto,
  Dimension,
  Round,
} from '../types/assessment.types'

export const dimensionService = {
  getAll: () => api.get<Dimension[]>('/dimensions').then((res) => res.data),
}

export const assessmentService = {
  findByStoreAndRound: (storeId: string, round: Round) =>
    api
      .get<PaginatedResponse<AssessmentSummary>>('/assessments', {
        params: { storeId, round, limit: 1 },
      })
      .then((res) => res.data.items[0] ?? null),

  findAllByStore: (storeId: string) =>
    api
      .get<PaginatedResponse<AssessmentSummary>>('/assessments', {
        params: { storeId, limit: 5 },
      })
      .then((res) => res.data.items),

  getById: (id: string) => api.get<Assessment>(`/assessments/${id}`).then((res) => res.data),

  create: (data: CreateAssessmentDto) =>
    api.post<Assessment>('/assessments', data).then((res) => res.data),

  updateScore: (assessmentId: string, questionId: number, data: UpdateScoreDto) =>
    api
      .put<AssessmentQuestion>(`/assessments/${assessmentId}/scores/${questionId}`, data)
      .then((res) => res.data),

  submit: (assessmentId: string) =>
    api.post<Assessment>(`/assessments/${assessmentId}/submit`).then((res) => res.data),

  remove: (assessmentId: string) => api.delete(`/assessments/${assessmentId}`),
}
