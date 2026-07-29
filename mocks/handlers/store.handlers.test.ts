import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { storeHandlers } from './store.handlers';
import { storeDb } from '../fixtures/store.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import { API_URL } from '@/constants';
import type { Store } from '@/features/store/types/store.types';
import type { PaginatedResponse } from '@/types/api.types';

// Seed users these tests lean on: '5' is an ENTREPRENEUR owning store '1', '2'
// an ASSESSOR assigned stores 1/3/5, '3' a MENTOR assigned stores 2/4, '1' an
// ADMIN, '8' a VIEWER.
const ENTREPRENEUR_ID = '5';
const OWNED_STORE_ID = '1';
const ASSESSOR_ID = '2';
const MENTOR_ID = '3';
const ADMIN_ID = '1';
const VIEWER_ID = '8';

const server = setupServer(...storeHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  storeDb.reset();
  userDb.reset();
});
afterAll(() => server.close());

function as(userId: string): RequestInit {
  return { headers: { Authorization: `Bearer mock-access-${userId}` } };
}

async function listStores(userId: string): Promise<PaginatedResponse<Store>> {
  const res = await fetch(`${API_URL}/stores`, as(userId));
  expect(res.status).toBe(200);
  return (await res.json()) as PaginatedResponse<Store>;
}

describe('storeHandlers scoping', () => {
  it('lists an entrepreneur only the stores it owns', async () => {
    const body = await listStores(ENTREPRENEUR_ID);

    expect(body.items.map((s) => s.id)).toEqual([OWNED_STORE_ID]);
    expect(body.items[0].ownerId).toBe(ENTREPRENEUR_ID);
    expect(body.meta.total).toBe(1);
  });

  it('lists an assessor only its assignment list', async () => {
    const body = await listStores(ASSESSOR_ID);

    expect(body.items.map((s) => s.id).sort()).toEqual(['1', '3', '5']);
  });

  // A mentor holds the same list for the other reason: it reads a store's
  // assessment to build the IDP, and only for the stores it was handed.
  it('lists a mentor only its assignment list', async () => {
    const body = await listStores(MENTOR_ID);

    expect(body.items.map((s) => s.id).sort()).toEqual(['2', '4']);
  });

  it('refuses a mentor a store it was not assigned', async () => {
    const res = await fetch(`${API_URL}/stores/${OWNED_STORE_ID}`, as(MENTOR_ID));

    expect(res.status).toBe(403);
  });

  it('lists every store to an admin', async () => {
    const body = await listStores(ADMIN_ID);

    expect(body.items.length).toBeGreaterThan(3);
  });

  it('refuses an entrepreneur a store it does not own', async () => {
    const res = await fetch(`${API_URL}/stores/2`, as(ENTREPRENEUR_ID));

    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('PERM_001');
  });

  it('returns the owned store to its entrepreneur', async () => {
    const res = await fetch(`${API_URL}/stores/${OWNED_STORE_ID}`, as(ENTREPRENEUR_ID));

    expect(res.status).toBe(200);
    expect((await res.json()).phone).toBeDefined();
  });

  // The API omits the private keys rather than nulling them, so the web's
  // `store.documents ?? []` guards are exercised in mock mode too.
  it('narrows every field a viewer may not see', async () => {
    const body = await listStores(VIEWER_ID);

    expect(body.items[0]).not.toHaveProperty('phone');
    expect(body.items[0]).not.toHaveProperty('documents');
    expect(body.items[0]).toHaveProperty('name');
  });

  it('keeps a store an entrepreneur creates in its own list', async () => {
    const created = await fetch(`${API_URL}/stores`, {
      ...as(ENTREPRENEUR_ID),
      method: 'POST',
      headers: { ...as(ENTREPRENEUR_ID).headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'ร้านใหม่',
        province: 'ชลบุรี',
        storeType: 'อาหารตามสั่ง',
        ownerName: 'เจ้าของ',
        phone: '0800000000',
        address: '-',
      }),
    });
    expect(created.status).toBe(201);

    const body = await listStores(ENTREPRENEUR_ID);
    expect(body.items.map((s) => s.name)).toContain('ร้านใหม่');
  });

  it('forbids the stats aggregate to a role that cannot open /stores', async () => {
    const res = await fetch(`${API_URL}/stores/stats`, as(ASSESSOR_ID));

    expect(res.status).toBe(403);
  });

  // Programme-wide by design: the entrepreneur's list is scoped, this is not.
  it('counts every store in the stats an entrepreneur reads', async () => {
    const res = await fetch(`${API_URL}/stores/stats`, as(ENTREPRENEUR_ID));

    expect(res.status).toBe(200);
    expect((await res.json()).total).toBe(storeDb.getAll().length);
  });
});
