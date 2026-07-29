import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { API_URL } from '@/constants';
import { reportHandlers } from './report.handlers';
import { userDb } from '../fixtures/user.fixtures';

// Seed users: '1' is an ADMIN, '5' an ENTREPRENEUR, '2' an ASSESSOR.
const ADMIN_ID = '1';
const ENTREPRENEUR_ID = '5';
const ASSESSOR_ID = '2';

const server = setupServer(...reportHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => userDb.reset());
afterAll(() => server.close());

function as(userId: string): RequestInit {
  return { headers: { Authorization: `Bearer mock-access-${userId}` } };
}

// The cross-store matrix is the one report that puts a store's scores in front
// of another store's people — admin-only, matching the API.
describe('reportHandlers matrix gating', () => {
  it('answers an admin with the matrix', async () => {
    const res = await fetch(`${API_URL}/reports/rounds/T0/stores`, as(ADMIN_ID));

    expect(res.status).toBe(200);
  });

  it.each([
    ['an entrepreneur', ENTREPRENEUR_ID],
    ['an assessor', ASSESSOR_ID],
  ])('refuses %s', async (_label, userId) => {
    const res = await fetch(`${API_URL}/reports/rounds/T0/stores`, as(userId));

    expect(res.status).toBe(403);
  });

  it('refuses the export the same way', async () => {
    const res = await fetch(
      `${API_URL}/reports/rounds/T0/stores/export?format=xlsx`,
      as(ENTREPRENEUR_ID)
    );

    expect(res.status).toBe(403);
  });

  // The single-store report is unchanged — every signed-in role still reads it.
  it('leaves the single-store round report open to an entrepreneur', async () => {
    const res = await fetch(`${API_URL}/reports/stores/1/rounds/T0`, as(ENTREPRENEUR_ID));

    expect(res.status).toBe(200);
  });
});
