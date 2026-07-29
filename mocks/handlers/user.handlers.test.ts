import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { userHandlers } from './user.handlers';
import { userDb } from '../fixtures/user.fixtures';
import { API_URL } from '@/constants';

// Seed accounts: '8' is a PENDING viewer owning nothing, '5' an ENTREPRENEUR
// owning a store, '7' the SUPER_ADMIN.
const PENDING_ID = '8';
const STORE_OWNER_ID = '5';
const SUPER_ADMIN_ID = '7';

const server = setupServer(...userHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => userDb.reset());
afterAll(() => server.close());

function remove(id: string): Promise<Response> {
  return fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
}

describe('userHandlers delete', () => {
  it('removes a pending sign-up from the list', async () => {
    const res = await remove(PENDING_ID);

    expect(res.status).toBe(200);
    expect(userDb.findById(PENDING_ID)).toBeNull();
  });

  it('refuses to delete a user who still owns stores', async () => {
    const res = await remove(STORE_OWNER_ID);

    expect(res.status).toBe(409);
    expect(userDb.findById(STORE_OWNER_ID)).not.toBeNull();
  });

  it('refuses to delete the super admin', async () => {
    const res = await remove(SUPER_ADMIN_ID);

    expect(res.status).toBe(403);
    expect(userDb.findById(SUPER_ADMIN_ID)).not.toBeNull();
  });

  it('404s an unknown user', async () => {
    const res = await remove('does-not-exist');

    expect(res.status).toBe(404);
  });
});
