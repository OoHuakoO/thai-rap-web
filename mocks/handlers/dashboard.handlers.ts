import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import { hasPermission, isAssignmentScopedRole } from '@/constants/permissions';
import { PERMISSIONS, ROLES } from '@/types/auth.types';
import type {
  ActivityItem,
  AssessmentRound,
  Top20RoundFilter,
} from '@/features/dashboard/types/dashboard.types';
import type { NewsType } from '@/features/news/types/news.types';
import type { User } from '@/features/user/types/user.types';
import {
  buildIncubationProgress,
  buildKpis,
  buildProvinceComparison,
  buildProvinceDistribution,
  buildReportsStatus,
  buildStoreRoundScores,
  buildTop20,
  dashboardStores,
} from '../fixtures/dashboard.fixtures';
import type { DashboardStore } from '../factories/dashboard.factory';
import { newsDb } from '../fixtures/news.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import {
  forbidden,
  getMockUserId,
  getScenario,
  serverError,
  unauthorized,
} from '../utils/scenario';

const BASE_URL = `${API_URL}/dashboard`;

const ROUND_FILTERS: Top20RoundFilter[] = ['all', 'T0', 'T1', 'T2', 'T3'];
const ASSESSMENT_ROUNDS: AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

const DEFAULT_COMPARISON_FROM: AssessmentRound = 'T0';
const DEFAULT_COMPARISON_TO: AssessmentRound = 'T1';

const NEWS_TYPE_TO_ACTIVITY: Record<NewsType, ActivityItem['type']> = {
  GENERAL: 'announcement',
  EVENT: 'event',
  ALERT: 'warning',
};

const EXPORT_CSV_FILENAME = 'store-round-scores.csv';
const CSV_BOM = '﻿';

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

function getCaller(request: Request): User | null {
  const id = getMockUserId(request);
  return id ? userDb.findById(id) : null;
}

// Mirrors OVERVIEW_READ_ROLES on the API: a JUDGE holds no dashboard:read and
// is refused every card, rather than being handed an empty one. Same
// no-token-stays-open rule as scopedStores below.
function refuseWithoutOverview(request: Request): Response | null {
  const caller = getCaller(request);
  if (caller && !hasPermission(caller.role, PERMISSIONS.DASHBOARD_READ)) return forbidden();
  return null;
}

// Mirrors DashboardService's resolveStoreScope: an ENTREPRENEUR's overview
// covers the stores it owns, an assignment-scoped role's (ASSESSOR, MENTOR,
// JUDGE) the ones assigned to it, and every staff role keeps the project-wide
// numbers. Ownership and
// assignment live on the user record — what the /users dialogs write — so both
// are read from there rather than copied onto the dashboard rows.
//
// A request with no mock token stays unscoped: the handler tests call these
// endpoints without signing in, and every real call carries a token.
function scopedStores(request: Request): DashboardStore[] {
  const caller = getCaller(request);
  if (!caller) return dashboardStores;

  if (caller.role === ROLES.ENTREPRENEUR) {
    return dashboardStores.filter((store) => caller.ownedStoreIds.includes(store.storeId));
  }
  if (isAssignmentScopedRole(caller.role)) {
    return dashboardStores.filter((store) => caller.assignedStoreIds.includes(store.storeId));
  }
  return dashboardStores;
}

function parseRound(request: Request): Top20RoundFilter {
  const raw = new URL(request.url).searchParams.get('round');
  const match = ROUND_FILTERS.find((round) => round === raw);
  return match ?? 'all';
}

function parseAssessmentRound(raw: string | null, fallback: AssessmentRound): AssessmentRound {
  return ASSESSMENT_ROUNDS.find((round) => round === raw) ?? fallback;
}

function toStoreScoresCsv(rows: DashboardStore[]): string {
  const header = ['จังหวัด', 'ชื่อร้าน', 'ประเภทอาหาร', ...ASSESSMENT_ROUNDS];
  const body = buildStoreRoundScores(rows).map((row) => [
    row.province,
    row.storeName,
    row.storeType,
    ...ASSESSMENT_ROUNDS.map((round) => row.scores[round]?.toFixed(2) ?? ''),
  ]);

  // Excel only detects UTF-8 in a CSV when the byte-order mark is present —
  // without it the Thai columns open as mojibake.
  return `${CSV_BOM}${[header, ...body].map((cells) => cells.join(',')).join('\n')}`;
}

export const dashboardHandlers = [
  http.get(`${BASE_URL}/kpis`, ({ request }) => {
    return (
      checkScenario(request) ??
      refuseWithoutOverview(request) ??
      HttpResponse.json(buildKpis(scopedStores(request)))
    );
  }),

  http.get(`${BASE_URL}/province-distribution`, ({ request }) => {
    return (
      checkScenario(request) ??
      refuseWithoutOverview(request) ??
      HttpResponse.json(buildProvinceDistribution(scopedStores(request)))
    );
  }),

  http.get(`${BASE_URL}/top20`, ({ request }) => {
    return (
      checkScenario(request) ??
      refuseWithoutOverview(request) ??
      HttpResponse.json(buildTop20(scopedStores(request), parseRound(request)))
    );
  }),

  http.get(`${BASE_URL}/incubation-progress`, ({ request }) => {
    return (
      checkScenario(request) ??
      refuseWithoutOverview(request) ??
      HttpResponse.json(buildIncubationProgress(scopedStores(request)))
    );
  }),

  http.get(`${BASE_URL}/province-comparison`, ({ request }) => {
    const refusal = checkScenario(request) ?? refuseWithoutOverview(request);
    if (refusal) return refusal;

    const params = new URL(request.url).searchParams;
    return HttpResponse.json(
      buildProvinceComparison(
        scopedStores(request),
        parseAssessmentRound(params.get('from'), DEFAULT_COMPARISON_FROM),
        parseAssessmentRound(params.get('to'), DEFAULT_COMPARISON_TO)
      )
    );
  }),

  http.get(`${BASE_URL}/store-scores`, ({ request }) => {
    return (
      checkScenario(request) ??
      refuseWithoutOverview(request) ??
      HttpResponse.json(buildStoreRoundScores(scopedStores(request)))
    );
  }),

  // Mocks ship CSV, not XLSX — generating a real workbook needs a library the
  // web app deliberately doesn't carry. The client names the file from
  // Content-Disposition, so the download stays openable in mock mode.
  http.get(`${BASE_URL}/store-scores/export`, ({ request }) => {
    const refusal = checkScenario(request) ?? refuseWithoutOverview(request);
    if (refusal) return refusal;

    return new HttpResponse(toStoreScoresCsv(scopedStores(request)), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${EXPORT_CSV_FILENAME}"`,
      },
    });
  }),

  // Mirrors the API: the feed is whatever admins published on /news, nothing
  // else — so creating or deleting a news item really does change this card.
  // Not scoped, matching GET /news: it carries no store to narrow on — the
  // role check is the whole of the gate.
  http.get(`${BASE_URL}/activities`, ({ request }) => {
    const refusal = checkScenario(request) ?? refuseWithoutOverview(request);
    if (refusal) return refusal;

    const published: ActivityItem[] = newsDb.getAll().map((item) => ({
      type: NEWS_TYPE_TO_ACTIVITY[item.type],
      title: item.title,
      description: item.description,
      date: item.publishedAt,
      urgent: item.urgent,
    }));

    return HttpResponse.json(published);
  }),

  // A VIEWER reads no assessment, so no report exists for it — an empty list,
  // not a 403, keeps the card rendering (ReportService.listAvailableReports).
  // A JUDGE never reaches the card at all; refuseWithoutOverview turns it away
  // above.
  http.get(`${BASE_URL}/reports-status`, ({ request }) => {
    const refusal = checkScenario(request) ?? refuseWithoutOverview(request);
    if (refusal) return refusal;

    const caller = getCaller(request);
    if (caller && caller.role === ROLES.VIEWER) {
      return HttpResponse.json([]);
    }

    return HttpResponse.json(buildReportsStatus(scopedStores(request)));
  }),
];
