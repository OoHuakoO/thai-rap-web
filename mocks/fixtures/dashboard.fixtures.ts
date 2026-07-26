import type {
  ActivityItem,
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
  DASHBOARD_STORE_COUNT,
  DASHBOARD_TARGET_STORES,
  type DashboardStore,
} from '../factories/dashboard.factory';

const DATA_DATE = '2026-05-20T00:00:00.000Z';

const TOP20_SIZE = 20;
const COMPARISON_PROVINCE_LIMIT = 5;

// Single source for every figure below — the KPI cards, the donut, the funnel
// and the leaderboard are all counted off the same 100 stores, so they can
// never disagree with each other.
const stores: DashboardStore[] = createDashboardStores();

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : round2((part / whole) * 100);
}

function countReached(round: AssessmentRound): number {
  return stores.filter((store) => store.scores[round] !== null).length;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

const t0Completed = countReached('T0');
const t1Completed = countReached('T1');
const t2Completed = countReached('T2');
const t3Completed = countReached('T3');
const selectedStores = stores.filter((store) => store.isSelected).length;

// "Improved" means the score rose between any two consecutive rounds the store
// actually sat — counted once per store however many rounds it improved in.
const improvedStores = stores.filter((store) => {
  let previous: number | null = null;
  for (const round of DASHBOARD_ROUND_ORDER) {
    const score = store.scores[round];
    if (score === null) continue;
    if (previous !== null && score > previous) return true;
    previous = score;
  }
  return false;
}).length;

const assessedScores = stores
  .map(latestScore)
  .filter((score): score is number => score !== null);

export const dashboardKpis: DashboardKPIs = {
  totalStores: DASHBOARD_STORE_COUNT,
  targetStores: DASHBOARD_TARGET_STORES,
  t0Completed,
  t0Percentage: percentOf(t0Completed, DASHBOARD_STORE_COUNT),
  t1Completed,
  t1Percentage: percentOf(t1Completed, DASHBOARD_STORE_COUNT),
  t2Completed,
  t2Percentage: percentOf(t2Completed, DASHBOARD_STORE_COUNT),
  t3Completed,
  t3Percentage: percentOf(t3Completed, DASHBOARD_STORE_COUNT),
  selectedStores,
  selectedPercentage: percentOf(selectedStores, DASHBOARD_STORE_COUNT),
  improvedStores,
  improvementRate: percentOf(improvedStores, DASHBOARD_STORE_COUNT),
  avgScore: average(assessedScores),
  lastUpdated: DATA_DATE,
};

const provinceNames: string[] = [...new Set(stores.map((store) => store.province))];

export const provinceDistribution: ProvinceDistributionItem[] = provinceNames
  .map((province) => {
    const count = stores.filter((store) => store.province === province).length;
    return { province, count, percentage: percentOf(count, DASHBOARD_STORE_COUNT) };
  })
  .sort((a, b) => b.count - a.count);

export const incubationProgress: IncubationStep[] = [
  { label: 'คัดกรองเบื้องต้น', count: t0Completed },
  { label: 'ประเมิน T1', count: t1Completed },
  { label: 'พัฒนาศักยภาพ', count: t2Completed },
  { label: 'ประเมิน', count: t3Completed },
  { label: 'ผ่านเข้ารอบ', count: selectedStores },
].map((step) => ({ ...step, percentage: percentOf(step.count, DASHBOARD_STORE_COUNT) }));

// Only stores holding both scores count, so the two bars describe the same set
// of stores. Averaging every T0 against every T1 lets a province's T1 land
// below its T0 purely because the weaker stores dropped out before T1.
//
// Capped at the five largest provinces: the chart's axis and value labels
// collide past that, and a province with a handful of stores swings its own
// average by tens of points anyway.
export function getProvinceComparison(
  fromRound: AssessmentRound,
  toRound: AssessmentRound
): ProvinceComparison[] {
  return provinceDistribution
    .slice(0, COMPARISON_PROVINCE_LIMIT)
    .map(({ province }) => {
      const paired = stores.filter(
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

export const storeRoundScores: StoreRoundScores[] = [...stores]
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

// The store count still waiting on a T1 visit — the same number the KPI card
// shows, so the alert can't drift away from the data behind it.
const pendingT1 = t0Completed - t1Completed;

// Warnings only. The event/announcement rows in this feed come from the news
// module (mocks/fixtures/news.fixtures.ts) exactly as they do in the API —
// listing them here too rendered every announcement twice.
export const activities: ActivityItem[] = [
  {
    type: 'warning',
    title: `ร้านอาหาร ${pendingT1} ร้าน ยังไม่ประเมิน T1`,
    description: 'กรุณาติดตามและนัดหมายการประเมิน',
    date: '2026-05-20T00:00:00.000Z',
    urgent: true,
  },
];

export const reportsStatus: ReportStatusItem[] = [
  {
    id: 'rpt-01',
    name: 'รายงานสรุปภาพรวมโครงการ',
    format: 'PDF',
    createdAt: '2026-05-20T00:00:00.000Z',
    status: 'DONE',
    downloadUrl: '/reports/rpt-01/download',
  },
  {
    id: 'rpt-02',
    name: 'รายงานผลการประเมิน T1',
    format: 'XLSX',
    createdAt: '2026-05-20T00:00:00.000Z',
    status: 'DONE',
    downloadUrl: '/reports/rpt-02/download',
  },
  {
    id: 'rpt-03',
    name: 'รายงานคะแนนพิชชิงรอบคัดเลือก',
    format: 'PDF',
    createdAt: '2026-05-19T00:00:00.000Z',
    status: 'DONE',
    downloadUrl: '/reports/rpt-03/download',
  },
  {
    id: 'rpt-04',
    name: 'รายงานพัฒนาการรายจังหวัด',
    format: 'XLSX',
    createdAt: '2026-05-18T00:00:00.000Z',
    status: 'DONE',
    downloadUrl: '/reports/rpt-04/download',
  },
];

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
 * Ranks the 100 stores for the requested round. A round filter only considers
 * stores that actually reached it, so switching the filter narrows the pool
 * and genuinely reorders the table.
 */
export function getTop20ByRound(round: Top20RoundFilter): Top20Entry[] {
  const scored = stores
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

export const top20Stores: Top20Entry[] = getTop20ByRound('all');
