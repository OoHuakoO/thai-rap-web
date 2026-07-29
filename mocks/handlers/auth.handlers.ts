import { http, HttpResponse } from 'msw';
import { userDb } from '../fixtures/user.fixtures';
import { authSession } from '../fixtures/auth.fixtures';
import { MOCK_OTP, passwordResetDb } from '../fixtures/password-reset.fixtures';
import { createUser } from '../factories/user.factory';
import { getScenario, serverError } from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import { USER_STATUSES } from '@/features/user/types/user.types';
import type {
  ForgotPasswordDto,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  ResetPasswordDto,
  VerifyOtpDto,
  VerifyOtpResponse,
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

// A sign-up sits PENDING until a SUPER_ADMIN approves it, and the real API
// answers login with this 403 until then. The axios interceptor deliberately
// does not bounce a login 403 to /errors/403, so the form renders this message.
function accountPending(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_006', message: 'บัญชีกำลังรอการเปิดใช้งาน' } },
    { status: HTTP_STATUS.FORBIDDEN }
  );
}

function conflict(message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'USER_002', message } },
    { status: HTTP_STATUS.CONFLICT }
  );
}

function badRequest(code: string, message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code, message } },
    { status: HTTP_STATUS.BAD_REQUEST }
  );
}

function resetTokenInvalid(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: { code: 'AUTH_010', message: 'ลิงก์ตั้งรหัสผ่านใหม่ไม่ถูกต้องหรือหมดอายุแล้ว' },
    },
    { status: HTTP_STATUS.UNAUTHORIZED }
  );
}

function refreshTokenInvalid(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_004', message: 'refresh token ไม่ถูกต้อง' } },
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
    if (found.status === USER_STATUSES.PENDING) return accountPending();

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

    // createUser defaults to PENDING, and no session is opened: the account is
    // unusable until a SUPER_ADMIN approves it on /users. Signing the caller in
    // here would mock away the entire approval gate.
    const created = createUser({ name: body.name, email: body.email, role: body.role });
    userDb.create(created);

    const user: AuthUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
    };
    return HttpResponse.json<RegisterResponse>({ user }, { status: HTTP_STATUS.CREATED });
  }),

  // Envelope, unlike the other handlers: refresh is the one call that bypasses
  // the `api` instance (raw axios in services/api.ts, so a 401 retry can't
  // recurse), and that code reads `res.data.data` the way the real API replies.
  http.post(`${BASE_URL}/refresh`, () => {
    const userId = authSession.get();
    if (!userId) return refreshTokenInvalid();

    return HttpResponse.json<{ success: true; data: AuthTokens }>({
      success: true,
      data: mockTokens(userId),
    });
  }),

  http.post(`${BASE_URL}/logout`, () => {
    authSession.clear();
    return HttpResponse.json(null);
  }),

  // Answers 200 for any address, registered or not — same non-enumerable
  // behaviour as the real endpoint.
  http.post(`${BASE_URL}/forgot-password`, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as ForgotPasswordDto;
    if (userDb.getAll().some((u) => u.email === body.email)) {
      passwordResetDb.request(body.email);
    }
    return HttpResponse.json(null);
  }),

  http.post(`${BASE_URL}/verify-otp`, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as VerifyOtpDto;
    const found = passwordResetDb.find(body.email);

    if (!found || found.consumed) return badRequest('AUTH_007', 'รหัส OTP ไม่ถูกต้อง');
    if (scenario === 'otp-expired') return badRequest('AUTH_008', 'รหัส OTP หมดอายุแล้ว');
    if (passwordResetDb.isExhausted(body.email)) {
      return badRequest('AUTH_009', 'กรอกรหัส OTP ผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่');
    }

    if (body.otp !== MOCK_OTP) {
      passwordResetDb.countAttempt(body.email);
      return badRequest('AUTH_007', 'รหัส OTP ไม่ถูกต้อง');
    }

    return HttpResponse.json<VerifyOtpResponse>({
      resetToken: passwordResetDb.consume(body.email),
      expiresIn: 600,
    });
  }),

  http.post(`${BASE_URL}/reset-password`, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as ResetPasswordDto;
    const found = passwordResetDb.findByResetToken(body.resetToken);
    if (!found) return resetTokenInvalid();

    passwordResetDb.clear(found.email);
    authSession.clear();
    return HttpResponse.json(null);
  }),
];
