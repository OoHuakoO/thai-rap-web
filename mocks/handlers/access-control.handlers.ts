import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import type { AccessControlConfig, UpdateAccessControlDto } from '@/types/auth.types';
import { accessControlDb } from '../fixtures/access-control.fixtures';
import {
  forbidden,
  getScenario,
  serverError,
  unauthorized,
  validationError,
} from '../utils/scenario';

const BASE_URL = `${API_URL}/access-control`;

// Mirrors what the API records as `updatedBy` — the acting SUPER_ADMIN. The mock
// has no session, so it credits the seeded super admin.
const MOCK_ACTOR = 'นางสาวศิริวรรณ จันทร์ดี';

export const accessControlHandlers = [
  // GET /access-control
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    return HttpResponse.json<AccessControlConfig>(accessControlDb.get());
  }),

  // PUT /access-control
  http.put(BASE_URL, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as UpdateAccessControlDto;

    if (scenario === 'validation-error' || !body.rolePermissions || !body.roleScopes) {
      return validationError([
        ...(!body.rolePermissions
          ? [{ field: 'rolePermissions', message: 'rolePermissions is required' }]
          : []),
        ...(!body.roleScopes ? [{ field: 'roleScopes', message: 'roleScopes is required' }] : []),
      ]);
    }

    return HttpResponse.json<AccessControlConfig>(accessControlDb.update(body, MOCK_ACTOR));
  }),

  // POST /access-control/reset
  http.post(`${BASE_URL}/reset`, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    return HttpResponse.json<AccessControlConfig>(accessControlDb.reset());
  }),
];
