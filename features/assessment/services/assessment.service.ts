import api from '@/services/api';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Assessment,
  AssessmentSummary,
  AssessmentQuestion,
  AssessmentRank,
  CreateAssessmentDto,
  EvidenceFile,
  UpdateScoreDto,
  Dimension,
  Round,
} from '../types/assessment.types';

export const dimensionService = {
  getAll: () => api.get<Dimension[]>('/dimensions').then((res) => res.data),
};

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

  uploadEvidence: (assessmentId: string, questionId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Explicit multipart header — the client default of application/json would
    // make axios serialize the FormData to JSON instead of a multipart body.
    return api
      .post<EvidenceFile>(`/assessments/${assessmentId}/scores/${questionId}/evidence`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  deleteEvidence: (assessmentId: string, evidenceId: string) =>
    api.delete(`/assessments/${assessmentId}/evidence/${evidenceId}`),

  updateNotes: (assessmentId: string, notes: string) =>
    api.patch<Assessment>(`/assessments/${assessmentId}/notes`, { notes }).then((res) => res.data),

  getRank: (storeId: string, round: Round) =>
    api
      .get<AssessmentRank>('/assessments/rank', { params: { storeId, round } })
      .then((res) => res.data),
};
