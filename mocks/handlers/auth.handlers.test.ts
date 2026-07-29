import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { authHandlers } from './auth.handlers';
import { userDb } from '../fixtures/user.fixtures';
import { API_URL } from '@/constants';
import type { ApiErrorResponse } from '@/types/api.types';
import type { LoginResponse } from '@/features/auth/types/auth-response.types';

// Seed accounts these tests lean on: '1' is ACTIVE, '8' is still PENDING.
const ACTIVE_EMAIL = 'komsak01@gmail.com';
const PENDING_EMAIL = 'thanakorn.j@example.com';

const server = setupServer(...authHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => userDb.reset());
afterAll(() => server.close());

function login(email: string): Promise<Response> {
  return fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'whatever' }),
  });
}

describe('authHandlers login', () => {
  it('signs in an active account', async () => {
    const res = await login(ACTIVE_EMAIL);

    expect(res.status).toBe(200);
    const body = (await res.json()) as LoginResponse;
    expect(body.user.email).toBe(ACTIVE_EMAIL);
    expect(body.tokens.accessToken).toBeTruthy();
  });

  it('rejects an account still waiting for approval with 403 AUTH_006', async () => {
    const res = await login(PENDING_EMAIL);

    expect(res.status).toBe(403);
    const body = (await res.json()) as ApiErrorResponse;
    expect(body.error.code).toBe('AUTH_006');
    expect(body.error.message).toBe('บัญชีกำลังรอการเปิดใช้งาน');
  });

  it('rejects an unknown email with 401', async () => {
    const res = await login('nobody@example.com');

    expect(res.status).toBe(401);
  });
});
