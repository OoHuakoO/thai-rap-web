import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type {
  OverviewReport,
  RoundMatrixReport,
  RoundReport,
} from '@/features/report/types/report.types';
import {
  buildOverviewReport,
  buildRoundMatrix,
  buildRoundReport,
} from '../fixtures/report.fixtures';
import {
  forbidden,
  getMockUserId,
  getScenario,
  notFound,
  serverError,
  unauthorized,
} from '../utils/scenario';
import { userDb } from '../fixtures/user.fixtures';
import { ROLES, type Role } from '@/types/auth.types';

const BASE_URL = `${API_URL}/reports`;

const ROUNDS: AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

const MATRIX_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Matches normalizePagination() in the API — it defaults the same way.
const DEFAULT_PAGE_LIMIT = 10;

const REPORT_NOT_FOUND_CODE = 'RPT_001';
const REPORT_NOT_FOUND_MESSAGE = 'ยังไม่มีผลการประเมินรอบนี้ของร้านนี้';

// Mocks ship CSV/JSON stand-ins, not real Excel or PDF binaries — generating
// those needs libraries the web app deliberately doesn't carry. The client
// names the file from Content-Disposition, so the download stays openable.
const CSV_BOM = '﻿';

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

function parseRound(raw: string): AssessmentRound | null {
  return ROUNDS.find((round) => round === raw) ?? null;
}

// Only the cross-store matrix is role-gated — it is the one report that shows a
// store its neighbours' scores. Matches ReportService.getRoundMatrixReport.
// An unsigned request stays unscoped: handler tests call these without a token.
function refusedForNonAdmin(request: Request): Response | null {
  const id = getMockUserId(request);
  if (!id) return null;
  const caller = userDb.findById(id);
  if (caller && !MATRIX_ROLES.includes(caller.role)) {
    return forbidden('ไม่มีสิทธิ์ดูรายงานคะแนนรายมิติของทุกร้าน');
  }
  return null;
}

function csvResponse(filename: string, rows: string[][]): Response {
  const body = `${CSV_BOM}${rows.map((cells) => cells.join(',')).join('\n')}`;
  return new HttpResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export const reportHandlers = [
  http.get(`${BASE_URL}/stores/:storeId/rounds/:round`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const round = parseRound(String(params.round));
    const report = round ? buildRoundReport(String(params.storeId), round) : null;
    if (!report) return notFound(REPORT_NOT_FOUND_CODE, REPORT_NOT_FOUND_MESSAGE);

    return HttpResponse.json<RoundReport>(report);
  }),

  http.get(`${BASE_URL}/stores/:storeId/rounds/:round/export`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const round = parseRound(String(params.round));
    const report = round ? buildRoundReport(String(params.storeId), round) : null;
    if (!report) return notFound(REPORT_NOT_FOUND_CODE, REPORT_NOT_FOUND_MESSAGE);

    return csvResponse(`assessment-report-${report.round}.csv`, [
      ['มิติ', 'น้ำหนัก (%)', 'คะแนน (%)'],
      ...report.dimensions.map((d) => [d.dimensionName, String(d.weight), d.scorePct.toFixed(2)]),
    ]);
  }),

  http.get(`${BASE_URL}/rounds/:round/stores`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request) ?? refusedForNonAdmin(request);
    if (scenarioResponse) return scenarioResponse;

    const round = parseRound(String(params.round));
    if (!round) return notFound(REPORT_NOT_FOUND_CODE, REPORT_NOT_FOUND_MESSAGE);

    // Only `rows` is paged: the averages stay the round's, as the API keeps
    // them, so they read the same on every page.
    const report = buildRoundMatrix(round);
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.max(1, Number(url.searchParams.get('limit') ?? DEFAULT_PAGE_LIMIT));
    const total = report.rows.length;

    return HttpResponse.json<RoundMatrixReport>({
      ...report,
      rows: report.rows.slice((page - 1) * limit, page * limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  http.get(`${BASE_URL}/rounds/:round/stores/export`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request) ?? refusedForNonAdmin(request);
    if (scenarioResponse) return scenarioResponse;

    const round = parseRound(String(params.round));
    if (!round) return notFound(REPORT_NOT_FOUND_CODE, REPORT_NOT_FOUND_MESSAGE);

    const report = buildRoundMatrix(round);
    return csvResponse(`assessment-report-stores-${round}.csv`, [
      [
        'รหัสร้าน',
        'ชื่อร้าน',
        'คะแนนถ่วงน้ำหนัก',
        ...report.dimensions.map((d) => d.dimensionName),
      ],
      ...report.rows.map((row) => [
        row.storeCode,
        row.storeName,
        String(row.weightedScore ?? ''),
        ...report.dimensions.map((d) => String(row.scoresByDimension[d.dimensionId] ?? '')),
      ]),
    ]);
  }),

  http.get(`${BASE_URL}/stores/:storeId/overview`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const report = buildOverviewReport(String(params.storeId));
    if (!report) return notFound(REPORT_NOT_FOUND_CODE, REPORT_NOT_FOUND_MESSAGE);

    return HttpResponse.json<OverviewReport>(report);
  }),

  http.get(`${BASE_URL}/stores/:storeId/overview/export`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const report = buildOverviewReport(String(params.storeId));
    if (!report) return notFound(REPORT_NOT_FOUND_CODE, REPORT_NOT_FOUND_MESSAGE);

    return csvResponse('assessment-report-overview.csv', [
      ['รอบ', 'คะแนนรวม', 'เปลี่ยนแปลง', 'Zone'],
      ...report.rounds.map((r) => [
        r.round,
        String(r.totalScore ?? ''),
        String(r.delta ?? ''),
        r.zone ?? '',
      ]),
    ]);
  }),
];
