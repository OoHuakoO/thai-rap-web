import { http, HttpResponse } from 'msw';
import { provinceDb } from '../fixtures/province.fixtures';
import { getScenario, unauthorized, forbidden, serverError } from '../utils/scenario';
import type { Province } from '@/features/province/types/province.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/provinces`;

export const provinceHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    return HttpResponse.json<Province[]>(provinceDb.getAll());
  }),
];
