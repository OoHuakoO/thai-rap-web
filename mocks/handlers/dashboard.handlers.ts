import { http, HttpResponse } from 'msw'
import {
  dashboardKpi,
  provinceDistribution,
  top20Stores,
  incubationSteps,
  provinceComparison,
  activityItems,
  reportsStatus,
} from '../fixtures/dashboard.fixtures'
import type { ApiErrorResponse } from '@/types/api.types'
import { API_URL } from '@/constants'

const BASE_URL = `${API_URL}/dashboard`

function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success'
}

function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { message: 'Internal server error', statusCode: 500 },
    { status: 500 }
  )
}

export const dashboardHandlers = [
  http.get(`${BASE_URL}/kpi`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(dashboardKpi)
  }),

  http.get(`${BASE_URL}/province-distribution`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(provinceDistribution)
  }),

  http.get(`${BASE_URL}/top20`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(top20Stores)
  }),

  http.get(`${BASE_URL}/incubation-steps`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(incubationSteps)
  }),

  http.get(`${BASE_URL}/province-comparison`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(provinceComparison)
  }),

  http.get(`${BASE_URL}/activity`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(activityItems)
  }),

  http.get(`${BASE_URL}/reports-status`, ({ request }) => {
    if (getScenario(request) === 'server-error') return serverError()
    return HttpResponse.json(reportsStatus)
  }),
]
