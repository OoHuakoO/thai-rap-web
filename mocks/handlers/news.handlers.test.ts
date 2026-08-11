import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { API_URL } from '@/constants';
import type { NewsItem } from '@/features/news/types/news.types';
import { newsHandlers } from './news.handlers';
import { newsDb } from '../fixtures/news.fixtures';
import { userDb } from '../fixtures/user.fixtures';

// Seed users these tests lean on: '1' is an ADMIN, '4' a JUDGE.
const ADMIN_ID = '1';
const JUDGE_ID = '4';

const server = setupServer(...newsHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  newsDb.reset();
  userDb.reset();
});
afterAll(() => server.close());

function as(userId: string): RequestInit {
  return { headers: { Authorization: `Bearer mock-access-${userId}` } };
}

describe('newsHandlers role gating', () => {
  it('lists announcements to a role holding news:read', async () => {
    const res = await fetch(`${API_URL}/news`, as(ADMIN_ID));
    const items = (await res.json()) as NewsItem[];

    expect(res.status).toBe(200);
    expect(items.length).toBeGreaterThan(0);
  });

  // A judge is on the panel, not in the programme — the announcement feed is
  // closed to it the same way ภาพรวมโครงการ is (OVERVIEW_READ_ROLES on the API).
  it('refuses the list to a judge', async () => {
    const res = await fetch(`${API_URL}/news`, as(JUDGE_ID));

    expect(res.status).toBe(403);
  });

  it('refuses a single announcement to a judge', async () => {
    const [first] = newsDb.getAll();
    const res = await fetch(`${API_URL}/news/${first.id}`, as(JUDGE_ID));

    expect(res.status).toBe(403);
  });

  // Handler tests elsewhere call these endpoints without signing in, and every
  // real call carries a token.
  it('leaves a request with no mock token unscoped', async () => {
    const res = await fetch(`${API_URL}/news`);

    expect(res.status).toBe(200);
  });
});
