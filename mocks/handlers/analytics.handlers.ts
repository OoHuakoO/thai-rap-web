import { http, HttpResponse } from 'msw';
import type { PathParams } from 'msw';
import { API_URL } from '@/constants';
import type { AnalyticsQueryParams, ComparePair } from '@/features/analytics/types/analytics.types';
import { getStoreAnalytics, toAnalyticsCsv } from '../fixtures/analytics.fixtures';
import { forbidden, getScenario, notFound, serverError, unauthorized } from '../utils/scenario';

const BASE_URL = `${API_URL}/analytics`;

const STORE_NOT_FOUND_CODE = 'STORE_001';
const STORE_NOT_FOUND_MESSAGE = 'ไม่พบร้านที่ระบุ';

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

function parseParams(request: Request): AnalyticsQueryParams {
  const params = new URL(request.url).searchParams;
  return {
    compare: (params.get('compare') ?? 'T0vsT1') as ComparePair,
    ...(params.get('province') && { province: params.get('province') as string }),
  };
}

function storeIdOf(params: PathParams): string {
  return String(params.storeId);
}

export const analyticsHandlers = [
  http.get(`${BASE_URL}/:storeId/radar`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const analytics = getStoreAnalytics(storeIdOf(params), parseParams(request));
    if (!analytics) return notFound(STORE_NOT_FOUND_CODE, STORE_NOT_FOUND_MESSAGE);
    return HttpResponse.json(analytics.radar);
  }),

  http.get(`${BASE_URL}/:storeId/trend`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const analytics = getStoreAnalytics(storeIdOf(params), parseParams(request));
    if (!analytics) return notFound(STORE_NOT_FOUND_CODE, STORE_NOT_FOUND_MESSAGE);
    return HttpResponse.json(analytics.trend);
  }),

  http.get(`${BASE_URL}/:storeId/strengths-weaknesses`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const analytics = getStoreAnalytics(storeIdOf(params), parseParams(request));
    if (!analytics) return notFound(STORE_NOT_FOUND_CODE, STORE_NOT_FOUND_MESSAGE);
    return HttpResponse.json({
      strengths: analytics.strengths,
      weaknesses: analytics.weaknesses,
      redFlags: analytics.redFlags,
    });
  }),

  // Not in the OpenAPI contract yet — see features/analytics/README-gaps note.
  http.get(`${BASE_URL}/:storeId/export`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const storeId = storeIdOf(params);
    const analytics = getStoreAnalytics(storeId, parseParams(request));
    if (!analytics) return notFound(STORE_NOT_FOUND_CODE, STORE_NOT_FOUND_MESSAGE);

    return new HttpResponse(toAnalyticsCsv(analytics), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="store-${storeId}-analytics.csv"`,
      },
    });
  }),

  // Registered last: `/:storeId` would otherwise swallow every sub-path above.
  http.get(`${BASE_URL}/:storeId`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const analytics = getStoreAnalytics(storeIdOf(params), parseParams(request));
    if (!analytics) return notFound(STORE_NOT_FOUND_CODE, STORE_NOT_FOUND_MESSAGE);
    return HttpResponse.json(analytics);
  }),
];
