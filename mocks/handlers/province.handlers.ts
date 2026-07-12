import { http, HttpResponse } from 'msw';
import { provinceDb } from '../fixtures/province.fixtures';
import type { Province } from '@/features/province/types/province.types';
import type { ApiErrorResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/provinces`;

function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success';
}

function unauthorized(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_003', message: 'Unauthorized' } },
    { status: 401 }
  );
}

function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
    { status: 500 }
  );
}

export const provinceHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'server-error') return serverError();

    return HttpResponse.json<Province[]>(provinceDb.getAll());
  }),
];
