import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { assessmentHandlers } from './assessment.handlers';
import { assessmentDb, questionSeed } from '../fixtures/assessment.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import { API_URL } from '@/constants';
import type { Assessment } from '@/features/assessment/types/assessment.types';

// Seed users: '1' is an ADMIN, '2' an ASSESSOR.
const ADMIN_ID = '1';
const ASSESSOR_ID = '2';
const STORE_ID = '1';

const server = setupServer(...assessmentHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  assessmentDb.reset();
  userDb.reset();
});
afterAll(() => server.close());

function as(userId: string): HeadersInit {
  return { Authorization: `Bearer mock-access-${userId}`, 'Content-Type': 'application/json' };
}

async function createSubmittedRound(): Promise<Assessment> {
  const createRes = await fetch(`${API_URL}/assessments`, {
    method: 'POST',
    headers: as(ADMIN_ID),
    body: JSON.stringify({ storeId: STORE_ID, round: 'T0' }),
  });
  const created = (await createRes.json()) as Assessment;

  for (const question of questionSeed) {
    await fetch(`${API_URL}/assessments/${created.id}/scores/${question.id}`, {
      method: 'PUT',
      headers: as(ADMIN_ID),
      body: JSON.stringify({ rawScore: 2 }),
    });
  }

  const submitRes = await fetch(`${API_URL}/assessments/${created.id}/submit`, {
    method: 'POST',
    headers: as(ADMIN_ID),
  });
  return (await submitRes.json()) as Assessment;
}

function putScore(assessmentId: string, questionId: number, rawScore: number, userId: string) {
  return fetch(`${API_URL}/assessments/${assessmentId}/scores/${questionId}`, {
    method: 'PUT',
    headers: as(userId),
    body: JSON.stringify({ rawScore }),
  });
}

describe('assessmentHandlers on a submitted round', () => {
  it('rejects a score change from an assessor with ASSESS_004', async () => {
    const submitted = await createSubmittedRound();

    const res = await putScore(submitted.id, 1, 4, ASSESSOR_ID);

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('ASSESS_004');
  });

  it('accepts a score change from an admin', async () => {
    const submitted = await createSubmittedRound();

    const res = await putScore(submitted.id, 1, 4, ADMIN_ID);

    expect(res.status).toBe(200);
    expect((await res.json()).rawScore).toBe(4);
  });

  // The API re-freezes totalScore on every admin correction; a mock that keeps
  // the submit-time value would hide a stale-score bug in the UI.
  it('re-freezes totalScore after an admin correction', async () => {
    const submitted = await createSubmittedRound();
    expect(submitted.totalScore).toBe(50);

    await putScore(submitted.id, 1, 4, ADMIN_ID);
    const res = await fetch(`${API_URL}/assessments/${submitted.id}`, { headers: as(ADMIN_ID) });
    const reread = (await res.json()) as Assessment;

    expect(reread.totalScore).toBeGreaterThan(50);
    expect(reread.totalScore).toBe(reread.currentScore);
  });

  it('still rejects a draft save from an admin — the round stays finished', async () => {
    const submitted = await createSubmittedRound();

    const res = await fetch(`${API_URL}/assessments/${submitted.id}/draft`, {
      method: 'PATCH',
      headers: as(ADMIN_ID),
    });

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('ASSESS_004');
  });

  it('accepts an admin notes edit on a submitted round', async () => {
    const submitted = await createSubmittedRound();

    const res = await fetch(`${API_URL}/assessments/${submitted.id}/notes`, {
      method: 'PATCH',
      headers: as(ADMIN_ID),
      body: JSON.stringify({ notes: 'แก้ไขภายหลัง' }),
    });

    expect(res.status).toBe(200);
    expect(((await res.json()) as Assessment).notes).toBe('แก้ไขภายหลัง');
  });

  it('rejects an assessor notes edit on a submitted round', async () => {
    const submitted = await createSubmittedRound();

    const res = await fetch(`${API_URL}/assessments/${submitted.id}/notes`, {
      method: 'PATCH',
      headers: as(ASSESSOR_ID),
      body: JSON.stringify({ notes: 'ห้ามแก้' }),
    });

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('ASSESS_004');
  });
});
