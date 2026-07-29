import type {
  AssessmentRound,
  DashboardKPIs,
  IncubationStep,
  ProvinceComparison,
  ProvinceDistributionItem,
  ReportStatusItem,
  StoreRoundScores,
  Top20Entry,
  Top20RoundFilter,
} from '@/features/dashboard/types/dashboard.types';
import {
  createDashboardStores,
  latestScore,
  DASHBOARD_ROUND_ORDER,
  DASHBOARD_TARGET_STORES,
  type DashboardStore,
} from '../factories/dashboard.factory';
import { storeDb } from './store.fixtures';

const DATA_DATE = '2026-05-20T00:00:00.000Z';

const TOP20_SIZE = 20;
const COMPARISON_PROVINCE_LIMIT = 5;

// The synthetic set carries its own store ids, which no user record points at —
// an assessor's assignment list would then match nothing and every scoped card
// would come back empty. Overlaying the real directory onto the first rows
// gives the owned/assigned ids the /users dialogs write something to resolve
// against, and makes a store's row on the overview the same store the /stores
// page lists. The relationship itself still lives only on the user record.
function linkToDirectory(rows: DashboardStore[]): DashboardStore[] {
  const directory = storeDb.getAll();
  return rows.map((row, index) => {
    const real = directory[index];
    if (!real) return row;
    return {
      ...row,
      storeId: real.id,
      storeName: real.name,
      province: real.province ?? row.province,
      storeType: real.storeType ?? row.storeType,
    };
  });
}

// Single source for every figure below — the KPI cards, the donut, the funnel
// and the leaderboard are all counted off the same 100 stores, so they can
// never disagree with each other.
export const dashboardStores: DashboardStore[] = linkToDirectory(createDashboardStores());

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : round2((part / whole) * 100);
}

function countReached(rows: DashboardStore[], round: AssessmentRound): number {
  return rows.filter((store) => store.scores[round] !== null).length;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

// "Improved" means the score rose between any two consecutive rounds the store
// actually sat — counted once per store however many rounds it improved in.
function hasImproved(store: DashboardStore): boolean {
  let previous: number | null = null;
  for (const round of DASHBOARD_ROUND_ORDER) {
    const score = store.scores[round];
    if (score === null) continue;
    if (previous !== null && score > previous) return true;
    previous = score;
  }
  return false;
}

export function buildKpis(rows: DashboardStore[]): DashboardKPIs {
  const total = rows.length;
  const t0Completed = countReached(rows, 'T0');
  const t1Completed = countReached(rows, 'T1');
  const t2Completed = countReached(rows, 'T2');
  const t3Completed = countReached(rows, 'T3');
  const selectedStores = rows.filter((store) => store.isSelected).length;
  const improvedStores = rows.filter(hasImproved).length;
  const assessedScores = rows.map(latestScore).filter((score): score is number => score !== null);

  return {
    totalStores: total,
    // The programme's own goal, not a count of what the caller reaches — a
    // narrowed role still measures itself against all of it, same as the API.
    targetStores: DASHBOARD_TARGET_STORES,
    t0Completed,
    t0Percentage: percentOf(t0Completed, total),
    t1Completed,
    t1Percentage: percentOf(t1Completed, total),
    t2Completed,
    t2Percentage: percentOf(t2Completed, total),
    t3Completed,
    t3Percentage: percentOf(t3Completed, total),
    selectedStores,
    selectedPercentage: percentOf(selectedStores, total),
    improvedStores,
    improvementRate: percentOf(improvedStores, total),
    avgScore: average(assessedScores),
    lastUpdated: DATA_DATE,
  };
}

export function buildProvinceDistribution(rows: DashboardStore[]): ProvinceDistributionItem[] {
  const provinceNames: string[] = [...new Set(rows.map((store) => store.province))];

  return provinceNames
    .map((province) => {
      const count = rows.filter((store) => store.province === province).length;
      return { province, count, percentage: percentOf(count, rows.length) };
    })
    .sort((a, b) => b.count - a.count);
}

export function buildIncubationProgress(rows: DashboardStore[]): IncubationStep[] {
  return [
    { label: 'คัดกรองเบื้องต้น', count: countReached(rows, 'T0') },
    { label: 'ประเมิน T1', count: countReached(rows, 'T1') },
    { label: 'พัฒนาศักยภาพ', count: countReached(rows, 'T2') },
    { label: 'ประเมิน', count: countReached(rows, 'T3') },
    { label: 'ผ่านเข้ารอบ', count: rows.filter((store) => store.isSelected).length },
  ].map((step) => ({ ...step, percentage: percentOf(step.count, rows.length) }));
}

// Only stores holding both scores count, so the two bars describe the same set
// of stores. Averaging every T0 against every T1 lets a province's T1 land
// below its T0 purely because the weaker stores dropped out before T1.
//
// Capped at the five largest provinces: the chart's axis and value labels
// collide past that, and a province with a handful of stores swings its own
// average by tens of points anyway.
export function buildProvinceComparison(
  rows: DashboardStore[],
  fromRound: AssessmentRound,
  toRound: AssessmentRound
): ProvinceComparison[] {
  return buildProvinceDistribution(rows)
    .slice(0, COMPARISON_PROVINCE_LIMIT)
    .map(({ province }) => {
      const paired = rows.filter(
        (store) =>
          store.province === province &&
          store.scores[fromRound] !== null &&
          store.scores[toRound] !== null
      );
      return {
        province,
        fromRound,
        toRound,
        fromScore: average(paired.map((store) => store.scores[fromRound] as number)),
        toScore: average(paired.map((store) => store.scores[toRound] as number)),
      };
    })
    .sort((a, b) => b.toScore - a.toScore);
}

export function buildStoreRoundScores(rows: DashboardStore[]): StoreRoundScores[] {
  return [...rows]
    .sort((a, b) => a.province.localeCompare(b.province) || a.storeName.localeCompare(b.storeName))
    .map((store) => ({
      storeId: store.storeId,
      storeName: store.storeName,
      province: store.province,
      storeType: store.storeType,
      scores: Object.fromEntries(
        DASHBOARD_ROUND_ORDER.map((round) => [round, store.scores[round]])
      ) as Record<AssessmentRound, number | null>,
    }));
}

// No activity fixture: the feed is the news module and nothing else, exactly
// as in the API — see mocks/fixtures/news.fixtures.ts.

const REPORT_FORMATS: { format: ReportStatusItem['format']; suffix: string }[] = [
  { format: 'XLSX', suffix: 'xlsx' },
  { format: 'PDF', suffix: 'pdf' },
];

const RECENT_REPORT_LIMIT = 5;

// Reports are derived from assessed rounds, not stored: the API builds one row
// per round plus one overview per store, in each format, and downloadUrl is the
// route that renders it. Ids mirror the API's `store:round:format` shape.
export function buildReportsStatus(rows: DashboardStore[]): ReportStatusItem[] {
  const reports: ReportStatusItem[] = [];

  for (const store of rows) {
    if (store.reachedRound === null) continue;

    for (const { format, suffix } of REPORT_FORMATS) {
      reports.push({
        id: `${store.storeId}:${store.reachedRound}:${suffix}`,
        name: `รายงานผลการประเมิน ${store.reachedRound} - ${store.storeName}`,
        format,
        createdAt: DATA_DATE,
        status: 'DONE',
        downloadUrl: `/reports/stores/${store.storeId}/rounds/${store.reachedRound}/export?format=${suffix}`,
      });
    }

    for (const { format, suffix } of REPORT_FORMATS) {
      reports.push({
        id: `${store.storeId}:overview:${suffix}`,
        name: `รายงานสรุปผลทุกรอบ - ${store.storeName}`,
        format,
        createdAt: DATA_DATE,
        status: 'DONE',
        downloadUrl: `/reports/stores/${store.storeId}/overview/export?format=${suffix}`,
      });
    }
  }

  return reports.slice(0, RECENT_REPORT_LIMIT);
}

function toEntry(store: DashboardStore, score: number, index: number): Top20Entry {
  return {
    rank: index + 1,
    storeId: store.storeId,
    storeName: store.storeName,
    province: store.province,
    storeType: store.storeType,
    t1Score: score,
  };
}

/**
 * Ranks the given stores for the requested round. A round filter only considers
 * stores that actually reached it, so switching the filter narrows the pool
 * and genuinely reorders the table.
 */
export function buildTop20(rows: DashboardStore[], round: Top20RoundFilter): Top20Entry[] {
  const scored = rows
    .map((store) => ({
      store,
      score: round === 'all' ? latestScore(store) : store.scores[round],
    }))
    .filter((item): item is { store: DashboardStore; score: number } => item.score !== null);

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP20_SIZE)
    .map((item, index) => toEntry(item.store, item.score, index));
}
