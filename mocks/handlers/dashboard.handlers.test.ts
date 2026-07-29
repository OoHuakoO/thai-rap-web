import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { dashboardHandlers } from './dashboard.handlers';
import { userDb } from '../fixtures/user.fixtures';
import { API_URL } from '@/constants';
import type {
  DashboardKPIs,
  ProvinceDistributionItem,
  ReportStatusItem,
  StoreRoundScores,
  Top20Entry,
} from '@/features/dashboard/types/dashboard.types';

// Seed users these tests lean on: '5' is an ENTREPRENEUR owning store '1', '2'
// an ASSESSOR assigned stores 1/3/5, '3' a MENTOR assigned stores 2/4, '1' an
// ADMIN, '4' a JUDGE.
const ENTREPRENEUR_ID = '5';
const OWNED_STORE_ID = '1';
const ASSESSOR_ID = '2';
const ASSESSOR_STORE_IDS = ['1', '3', '5'];
const MENTOR_ID = '3';
const MENTOR_STORE_IDS = ['2', '4'];
const ADMIN_ID = '1';
const JUDGE_ID = '4';

const server = setupServer(...dashboardHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => userDb.reset());
afterAll(() => server.close());

function as(userId: string): RequestInit {
  return { headers: { Authorization: `Bearer mock-access-${userId}` } };
}

async function get<T>(path: string, userId: string): Promise<T> {
  const res = await fetch(`${API_URL}/dashboard${path}`, as(userId));
  expect(res.status).toBe(200);
  return (await res.json()) as T;
}

describe('dashboardHandlers scoping', () => {
  it('counts only the stores an entrepreneur owns', async () => {
    const kpis = await get<DashboardKPIs>('/kpis', ENTREPRENEUR_ID);

    expect(kpis.totalStores).toBe(1);
  });

  it('counts only the stores an assessor is assigned', async () => {
    const kpis = await get<DashboardKPIs>('/kpis', ASSESSOR_ID);

    expect(kpis.totalStores).toBe(ASSESSOR_STORE_IDS.length);
  });

  it('counts only the stores a mentor is assigned', async () => {
    const kpis = await get<DashboardKPIs>('/kpis', MENTOR_ID);

    expect(kpis.totalStores).toBe(MENTOR_STORE_IDS.length);
  });

  it('keeps the project-wide count for a staff role', async () => {
    const kpis = await get<DashboardKPIs>('/kpis', ADMIN_ID);

    expect(kpis.totalStores).toBeGreaterThan(ASSESSOR_STORE_IDS.length);
  });

  // targetStores is the programme's own goal, not a count of what the caller
  // reaches — a narrowed role still measures itself against all of it.
  it('keeps targetStores project-wide for a narrowed role', async () => {
    const narrowed = await get<DashboardKPIs>('/kpis', ASSESSOR_ID);
    const staff = await get<DashboardKPIs>('/kpis', ADMIN_ID);

    expect(narrowed.targetStores).toBe(staff.targetStores);
  });

  it('ranks only the stores a narrowed role reaches', async () => {
    const assessorTop20 = await get<Top20Entry[]>('/top20', ASSESSOR_ID);
    expect(assessorTop20.every((entry) => ASSESSOR_STORE_IDS.includes(entry.storeId))).toBe(true);

    const mentorTop20 = await get<Top20Entry[]>('/top20', MENTOR_ID);
    expect(mentorTop20.every((entry) => MENTOR_STORE_IDS.includes(entry.storeId))).toBe(true);
  });

  it('lists only the stores a narrowed role reaches in the score table', async () => {
    const entrepreneurRows = await get<StoreRoundScores[]>('/store-scores', ENTREPRENEUR_ID);
    expect(entrepreneurRows.map((row) => row.storeId)).toEqual([OWNED_STORE_ID]);

    const mentorRows = await get<StoreRoundScores[]>('/store-scores', MENTOR_ID);
    expect(mentorRows.map((row) => row.storeId).sort()).toEqual(MENTOR_STORE_IDS);
  });

  it('exports only the stores a narrowed role reaches', async () => {
    const res = await fetch(`${API_URL}/dashboard/store-scores/export`, as(ENTREPRENEUR_ID));
    const csv = await res.text();

    // Header row plus the single owned store.
    expect(csv.trim().split('\n')).toHaveLength(2);
  });

  it('rolls provinces up over the narrowed set only', async () => {
    const rows = await get<ProvinceDistributionItem[]>('/province-distribution', ENTREPRENEUR_ID);

    expect(rows.reduce((sum, row) => sum + row.count, 0)).toBe(1);
  });

  it('offers a narrowed role only its own reports', async () => {
    const reports = await get<ReportStatusItem[]>('/reports-status', MENTOR_ID);

    expect(reports.every((report) => MENTOR_STORE_IDS.includes(report.id.split(':')[0]))).toBe(
      true
    );
  });

  // JUDGE reads no assessment, so no report exists for it — an empty list, not
  // a 403, so the dashboard card still renders.
  it('offers no reports to a role that cannot read assessments', async () => {
    const reports = await get<ReportStatusItem[]>('/reports-status', JUDGE_ID);

    expect(reports).toEqual([]);
  });

  // The feed carries no store to narrow on, matching GET /news.
  it('leaves the activity feed unscoped', async () => {
    const narrowed = await get<unknown[]>('/activities', MENTOR_ID);
    const staff = await get<unknown[]>('/activities', ADMIN_ID);

    expect(narrowed).toEqual(staff);
  });

  it('leaves a request with no mock token unscoped', async () => {
    const res = await fetch(`${API_URL}/dashboard/kpis`);
    const kpis = (await res.json()) as DashboardKPIs;
    const staff = await get<DashboardKPIs>('/kpis', ADMIN_ID);

    expect(kpis.totalStores).toBe(staff.totalStores);
  });
});
