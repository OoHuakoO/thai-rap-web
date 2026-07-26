import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type { OverviewReport, RoundReport } from '@/features/report/types/report.types';
import { buildOverviewReport, buildRoundReport } from '../fixtures/report.fixtures';
import { forbidden, getScenario, notFound, serverError, unauthorized } from '../utils/scenario';

const BASE_URL = `${API_URL}/reports`;

const ROUNDS: AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

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
