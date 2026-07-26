import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import type {
  ActivityItem,
  AssessmentRound,
  Top20RoundFilter,
} from '@/features/dashboard/types/dashboard.types';
import type { NewsType } from '@/features/news/types/news.types';
import {
  activities,
  dashboardKpis,
  getProvinceComparison,
  getTop20ByRound,
  incubationProgress,
  provinceDistribution,
  reportsStatus,
  storeRoundScores,
} from '../fixtures/dashboard.fixtures';
import { newsDb } from '../fixtures/news.fixtures';
import { forbidden, getScenario, serverError, unauthorized } from '../utils/scenario';

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

function parseRound(request: Request): Top20RoundFilter {
  const raw = new URL(request.url).searchParams.get('round');
  const match = ROUND_FILTERS.find((round) => round === raw);
  return match ?? 'all';
}

function parseAssessmentRound(raw: string | null, fallback: AssessmentRound): AssessmentRound {
  return ASSESSMENT_ROUNDS.find((round) => round === raw) ?? fallback;
}

function toStoreScoresCsv(): string {
  const header = ['จังหวัด', 'ชื่อร้าน', 'ประเภทอาหาร', ...ASSESSMENT_ROUNDS];
  const rows = storeRoundScores.map((row) => [
    row.province,
    row.storeName,
    row.storeType,
    ...ASSESSMENT_ROUNDS.map((round) => row.scores[round]?.toFixed(2) ?? ''),
  ]);

  // Excel only detects UTF-8 in a CSV when the byte-order mark is present —
  // without it the Thai columns open as mojibake.
  return `${CSV_BOM}${[header, ...rows].map((cells) => cells.join(',')).join('\n')}`;
}

export const dashboardHandlers = [
  http.get(`${BASE_URL}/kpis`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(dashboardKpis);
  }),

  http.get(`${BASE_URL}/province-distribution`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(provinceDistribution);
  }),

  http.get(`${BASE_URL}/top20`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(getTop20ByRound(parseRound(request)));
  }),

  http.get(`${BASE_URL}/incubation-progress`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(incubationProgress);
  }),

  http.get(`${BASE_URL}/province-comparison`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const params = new URL(request.url).searchParams;
    return HttpResponse.json(
      getProvinceComparison(
        parseAssessmentRound(params.get('from'), DEFAULT_COMPARISON_FROM),
        parseAssessmentRound(params.get('to'), DEFAULT_COMPARISON_TO)
      )
    );
  }),

  http.get(`${BASE_URL}/store-scores`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(storeRoundScores);
  }),

  // Mocks ship CSV, not XLSX — generating a real workbook needs a library the
  // web app deliberately doesn't carry. The client names the file from
  // Content-Disposition, so the download stays openable in mock mode.
  http.get(`${BASE_URL}/store-scores/export`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    return new HttpResponse(toStoreScoresCsv(), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${EXPORT_CSV_FILENAME}"`,
      },
    });
  }),

  // Mirrors the API: auto-generated warnings first, then whatever admins have
  // published — so creating a news item really does change this feed.
  http.get(`${BASE_URL}/activities`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const published: ActivityItem[] = newsDb.getAll().map((item) => ({
      type: NEWS_TYPE_TO_ACTIVITY[item.type],
      title: item.title,
      description: item.description,
      date: item.publishedAt,
      urgent: item.urgent,
    }));

    return HttpResponse.json([...activities, ...published]);
  }),

  http.get(`${BASE_URL}/reports-status`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(reportsStatus);
  }),
];
