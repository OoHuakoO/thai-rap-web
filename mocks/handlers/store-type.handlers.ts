import { http, HttpResponse } from 'msw';
import { storeTypeDb } from '../fixtures/store-type.fixtures';
import { getScenario, unauthorized, forbidden, serverError } from '../utils/scenario';
import type { StoreType } from '@/features/store-type/types/store-type.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/store-types`;

export const storeTypeHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    return HttpResponse.json<StoreType[]>(storeTypeDb.getAll());
  }),
];
