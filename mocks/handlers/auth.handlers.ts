import { http, HttpResponse } from 'msw';
import { userDb } from '../fixtures/user.fixtures';
import { authSession } from '../fixtures/auth.fixtures';
import { createUser } from '../factories/user.factory';
import { getScenario, serverError } from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import type {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  AuthTokens,
} from '@/features/auth/types/auth-response.types';
import type { ApiErrorResponse } from '@/types/api.types';
import type { AuthUser } from '@/types/auth.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/auth`;

// login failures use their own code (AUTH_001, Thai copy) — distinct from the
// generic AUTH_003 "Unauthorized" used by route-guard checks elsewhere.
function unauthorized(message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_001', message } },
    { status: HTTP_STATUS.UNAUTHORIZED }
  );
}

function conflict(message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'USER_002', message } },
    { status: HTTP_STATUS.CONFLICT }
  );
}

function refreshTokenInvalid(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_004', message: 'Refresh token is invalid' } },
    { status: HTTP_STATUS.UNAUTHORIZED }
  );
}

function mockTokens(userId: string): AuthTokens {
  return {
    accessToken: `mock-access-${userId}`,
    expiresIn: 900,
  };
}

export const authHandlers = [
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'server-error') return serverError();
    if (scenario === 'invalid-credentials') return unauthorized();

    const body = (await request.json()) as LoginDto;

    const found = userDb.getAll().find((u) => u.email === body.email);
    if (!found) return unauthorized();

    authSession.set(found.id);
    const user: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role };
    return HttpResponse.json<LoginResponse>({ user, tokens: mockTokens(found.id) });
  }),

  http.post(`${BASE_URL}/register`, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as RegisterDto;

    if (userDb.getAll().some((u) => u.email === body.email)) {
      return conflict('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const created = createUser({ name: body.name, email: body.email, role: body.role });
    userDb.create(created);

    authSession.set(created.id);
    const user: AuthUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
    };
    return HttpResponse.json<RegisterResponse>(
      { user, tokens: mockTokens(created.id) },
      { status: HTTP_STATUS.CREATED }
    );
  }),

  http.post(`${BASE_URL}/refresh`, () => {
    const userId = authSession.get();
    if (!userId) return refreshTokenInvalid();

    return HttpResponse.json<AuthTokens>(mockTokens(userId));
  }),

  http.post(`${BASE_URL}/logout`, () => {
    authSession.clear();
    return HttpResponse.json(null);
  }),
];
