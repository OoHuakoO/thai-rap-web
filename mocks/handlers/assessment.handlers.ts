import { http, HttpResponse } from 'msw'
import { assessmentDb, dimensionSeed, questionSeed } from '../fixtures/assessment.fixtures'
import type {
  Assessment,
  AssessmentSummary,
  AssessmentQuestion,
  CreateAssessmentDto,
  UpdateScoreDto,
  Dimension,
  Question,
} from '@/features/assessment/types/assessment.types'
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types'
import { API_URL } from '@/constants'

const BASE_URL = `${API_URL}`

function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success'
}

function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
    { status: 500 }
  )
}

function notFound(code: string, message: string): Response {
  return HttpResponse.json<ApiErrorResponse>({ success: false, error: { code, message } }, { status: 404 })
}

function conflict(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'ASSESS_002', message: 'Assessment already exists for this round' } },
    { status: 409 }
  )
}

export const assessmentHandlers = [
  http.get(`${BASE_URL}/dimensions`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json<Dimension[]>(dimensionSeed)
  }),

  http.get(`${BASE_URL}/questions`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const url = new URL(request.url)
    const dimensionId = url.searchParams.get('dimensionId')
    const items = dimensionId
      ? questionSeed.filter((q) => q.dimensionId === Number(dimensionId))
      : questionSeed
    return HttpResponse.json<Question[]>(items)
  }),

  http.get(`${BASE_URL}/assessments`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const url = new URL(request.url)
    const storeId = url.searchParams.get('storeId')
    const round = url.searchParams.get('round')

    let items = storeId ? assessmentDb.findAllByStore(storeId) : []
    if (round) items = items.filter((a) => a.round === round)

    return HttpResponse.json<PaginatedResponse<AssessmentSummary>>({
      items,
      meta: { page: 1, limit: items.length || 1, total: items.length, totalPages: 1 },
    })
  }),

  http.get(`${BASE_URL}/assessments/:id`, ({ request, params }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const assessment = assessmentDb.findById(params.id as string)
    if (!assessment) return notFound('ASSESS_001', 'Assessment not found')
    return HttpResponse.json<Assessment>(assessment)
  }),

  http.post(`${BASE_URL}/assessments`, async ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const body = (await request.json()) as CreateAssessmentDto
    if (assessmentDb.findByStoreAndRound(body.storeId, body.round)) return conflict()
    const created = assessmentDb.create(body.storeId, body.round, 'mock-assessor')
    return HttpResponse.json<Assessment>(created, { status: 201 })
  }),

  http.put(`${BASE_URL}/assessments/:id/scores/:questionId`, async ({ request, params }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const body = (await request.json()) as UpdateScoreDto
    const updated = assessmentDb.updateScore(
      params.id as string,
      Number(params.questionId),
      body
    )
    if (!updated) return notFound('ASSESS_001', 'Assessment not found')
    const question = updated.questions.find((q) => q.questionId === Number(params.questionId))!
    return HttpResponse.json<AssessmentQuestion>(question)
  }),

  http.post(`${BASE_URL}/assessments/:id/submit`, ({ request, params }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const updated = assessmentDb.submit(params.id as string)
    if (!updated) return notFound('ASSESS_001', 'Assessment not found')
    return HttpResponse.json<Assessment>(updated, { status: 201 })
  }),

  http.delete(`${BASE_URL}/assessments/:id`, ({ request, params }) => {
    if (getScenario(request) === 'server-error') return serverError()
    const removed = assessmentDb.remove(params.id as string)
    if (!removed) return notFound('ASSESS_001', 'Assessment not found')
    return new HttpResponse(null, { status: 200 })
  }),
]
