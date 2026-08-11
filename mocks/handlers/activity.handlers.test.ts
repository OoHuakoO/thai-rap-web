// @vitest-environment node
//
// The photo-upload handler reads `request.formData()`, and jsdom's `File` is a
// different class from the one undici's multipart parser accepts — a File built
// under jsdom fails its type check before the handler ever runs. Nothing here
// touches the DOM, so the node environment is both correct and sufficient.
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { API_URL } from '@/constants';
import type { Activity } from '@/features/activity/types/activity.types';
import type { PaginatedResponse } from '@/types/api.types';
import { activityHandlers } from './activity.handlers';
import { activityDb } from '../fixtures/activity.fixtures';
import { userDb } from '../fixtures/user.fixtures';

// Seed users these tests lean on: '1' is an ADMIN, '4' a JUDGE, '8' a VIEWER.
const ADMIN_ID = '1';
const JUDGE_ID = '4';
const VIEWER_ID = '8';

const server = setupServer(...activityHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  activityDb.reset();
  userDb.reset();
});
afterAll(() => server.close());

function as(userId: string): RequestInit {
  return { headers: { Authorization: `Bearer mock-access-${userId}` } };
}

function writeAs(userId: string, method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: {
      Authorization: `Bearer mock-access-${userId}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

const newActivity = {
  title: 'กิจกรรมใหม่',
  description: 'รายละเอียด',
  activityDate: '2026-07-01T00:00:00.000Z',
};

describe('activityHandlers role gating', () => {
  // Reads carry no role check at all — every signed-in role holds
  // activity:read, judge and viewer included.
  it.each([ADMIN_ID, JUDGE_ID, VIEWER_ID])('lists albums to user %s', async (userId) => {
    const res = await fetch(`${API_URL}/activities`, as(userId));
    const page = (await res.json()) as PaginatedResponse<Activity>;

    expect(res.status).toBe(200);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it.each([JUDGE_ID, VIEWER_ID])('serves a single album to user %s', async (userId) => {
    const [first] = activityDb.getAll();
    const res = await fetch(`${API_URL}/activities/${first.id}`, as(userId));

    expect(res.status).toBe(200);
  });

  it('creates an album for an admin', async () => {
    const res = await fetch(`${API_URL}/activities`, writeAs(ADMIN_ID, 'POST', newActivity));

    expect(res.status).toBe(200);
    expect(activityDb.getAll()).toHaveLength(4);
  });

  it.each([JUDGE_ID, VIEWER_ID])('refuses a create from user %s', async (userId) => {
    const res = await fetch(`${API_URL}/activities`, writeAs(userId, 'POST', newActivity));

    expect(res.status).toBe(403);
    expect(activityDb.getAll()).toHaveLength(3);
  });

  it('refuses an edit and a delete from a role without activity:write', async () => {
    const [first] = activityDb.getAll();

    const patch = await fetch(
      `${API_URL}/activities/${first.id}`,
      writeAs(VIEWER_ID, 'PATCH', { title: 'แก้' })
    );
    const remove = await fetch(`${API_URL}/activities/${first.id}`, writeAs(VIEWER_ID, 'DELETE'));

    expect(patch.status).toBe(403);
    expect(remove.status).toBe(403);
    expect(activityDb.findById(first.id)?.title).toBe(first.title);
  });

  it('refuses a photo write from a role without activity:write', async () => {
    const album = activityDb.getAll().find((item) => item.photos.length > 0);
    const photoId = album?.photos[0].id ?? '';

    const res = await fetch(
      `${API_URL}/activities/${album?.id}/photos/${photoId}`,
      writeAs(JUDGE_ID, 'DELETE')
    );

    expect(res.status).toBe(403);
  });

  // Handler tests elsewhere call these endpoints without signing in, and every
  // real call carries a token.
  it('leaves a request with no mock token unscoped', async () => {
    const res = await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActivity),
    });

    expect(res.status).toBe(200);
  });
});

describe('activityHandlers album shape', () => {
  it('paginates and filters by search', async () => {
    const res = await fetch(`${API_URL}/activities?search=เชียงใหม่&page=1&limit=10`, as(ADMIN_ID));
    const page = (await res.json()) as PaginatedResponse<Activity>;

    expect(page.meta.total).toBe(1);
    expect(page.items[0].title).toContain('เชียงใหม่');
  });

  it('lists newest activity date first', async () => {
    const res = await fetch(`${API_URL}/activities`, as(ADMIN_ID));
    const page = (await res.json()) as PaginatedResponse<Activity>;

    expect(page.items.map((item) => item.id)).toEqual([
      'activity-01',
      'activity-02',
      'activity-03',
    ]);
  });

  it('keeps photoCount in step with the photos it holds', async () => {
    const [first] = activityDb.getAll();
    const form = new FormData();
    form.append('files', new File(['a'], 'a.jpg', { type: 'image/jpeg' }));
    form.append('files', new File(['b'], 'b.jpg', { type: 'image/jpeg' }));

    const res = await fetch(`${API_URL}/activities/${first.id}/photos`, {
      method: 'POST',
      headers: { Authorization: `Bearer mock-access-${ADMIN_ID}` },
      body: form,
    });
    const updated = (await res.json()) as Activity;

    expect(updated.photos).toHaveLength(first.photos.length + 2);
    expect(updated.photoCount).toBe(updated.photos.length);
  });

  it('404s a photo that belongs to another album', async () => {
    const res = await fetch(
      `${API_URL}/activities/activity-03/photos/activity-01-photo-1`,
      writeAs(ADMIN_ID, 'DELETE')
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('ACT_002');
  });
});
