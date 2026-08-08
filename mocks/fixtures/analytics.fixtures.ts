import type { RedFlag } from '@/features/assessment/types/assessment.types';
import type {
  AnalyticsQueryParams,
  StoreAnalytics,
} from '@/features/analytics/types/analytics.types';
import { getZone } from '@/features/assessment/utils/zone';
import { dimensionSeed } from './assessment.fixtures';
import { storeDb } from './store.fixtures';

/** Rounds the analytics mock has data for, in funnel order. */
const ROUND_ORDER = ['T0', 'T1', 'T2', 'T3'] as const;
type MockRound = (typeof ROUND_ORDER)[number];

const SERIES_LABELS: Record<MockRound, string> = {
  T0: 'T0 (เริ่มต้น)',
  T1: 'T1 (หลังค่าย)',
  T2: 'T2 (Field Audit)',
  T3: 'T3 (ติดตาม 1 เดือน)',
};

const SERIES_COLOR_BASELINE = '#7A51A0';
const SERIES_COLOR_CURRENT = '#F17128';

/** Matches SERIES_COLORS in analytics-display.constants.ts, round for round. */
const SERIES_COLORS: Record<MockRound, string> = {
  T0: SERIES_COLOR_BASELINE,
  T1: SERIES_COLOR_CURRENT,
  T2: '#10B981',
  T3: '#2563EB',
};

// Baseline profile taken from the design mock-up, read against the project's
// real 8 dimensions (docs §5). Every other store is derived from this by a
// deterministic per-store offset, so the mock stays stable across reloads.
const BASE_T0 = [72, 61, 65, 58, 48, 55, 41, 56];
const BASE_T1 = [82, 75, 78, 70, 62, 68, 58, 69];

/** Later rounds keep improving, with diminishing returns. */
const ROUND_GAIN: Record<MockRound, number> = { T0: 0, T1: 0, T2: 6, T3: 10 };

const MAX_DIMENSION_SCORE = 100;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(MAX_DIMENSION_SCORE, Math.round(value)));
}

/** Stable pseudo-offset per store so each store's chart looks different. */
function storeOffset(storeId: string, dimensionIndex: number): number {
  const seed = Number(storeId) || storeId.length;
  return ((seed * 7 + dimensionIndex * 13) % 21) - 10;
}

function dimensionScores(storeId: string, round: MockRound): number[] {
  const base = round === 'T0' ? BASE_T0 : BASE_T1;
  return base.map((value, index) =>
    clampScore(value + ROUND_GAIN[round] + storeOffset(storeId, index))
  );
}

/** docs §8.2 — weighted total = Σ (dimension score × dimension weight). */
function weightedTotal(scores: number[]): number {
  const total = scores.reduce(
    (sum, score, index) => sum + score * (dimensionSeed[index]?.weight ?? 0),
    0
  );
  return round2(total / 100);
}

/** docs §8.4 — a 0 baseline has no defined growth rate. */
function improvementRate(from: number, to: number): number | null {
  if (from === 0) return null;
  return round2(((to - from) / from) * 100);
}

/**
 * docs §11 — Incubation Readiness Score. The last three components are judged
 * data the mock does not model, so they are fixed per store rather than
 * derived from the assessment scores.
 */
function incubationReadiness(storeId: string, t1Total: number, rate: number | null): number {
  const seed = Number(storeId) || storeId.length;
  const pitchingScore = 60 + ((seed * 5) % 30);
  const mindsetScore = 65 + ((seed * 3) % 25);
  const evidenceScore = 55 + ((seed * 11) % 35);
  const improvementScore = Math.min(100, Math.max(0, (rate ?? 0) * 3));

  return round2(
    t1Total * 0.4 +
      improvementScore * 0.25 +
      pitchingScore * 0.2 +
      mindsetScore * 0.1 +
      evidenceScore * 0.05
  );
}

function parseRounds(compare: string): [MockRound, MockRound] {
  const [from, to] = compare.split('vs');
  const isRound = (value: string): value is MockRound =>
    (ROUND_ORDER as readonly string[]).includes(value);
  return [isRound(from) ? from : 'T0', isRound(to) ? to : 'T1'];
}

function topDimensions(scores: number[], count: number, ascending: boolean) {
  return scores
    .map((score, index) => ({
      dimensionId: dimensionSeed[index].id,
      name: dimensionSeed[index].name,
      score,
    }))
    .sort((a, b) => (ascending ? a.score - b.score : b.score - a.score))
    .slice(0, count);
}

const HIGHLIGHT_COUNT = 3;

/** docs §10 — triggered when the matching questions fall below threshold. */
function buildRedFlags(storeId: string, scores: number[]): RedFlag[] {
  const flags: RedFlag[] = [];
  const assessmentId = `mock-assessment-${storeId}`;

  if (scores[4] < 60) {
    flags.push({
      id: `${storeId}-financial`,
      assessmentId,
      type: 'FINANCIAL',
      severity: scores[4] < 50 ? 'CRITICAL' : 'WARNING',
      triggerQuestions: [28, 29, 30, 31],
      recommendation:
        'ทำ Costing Sheet เมนูหลัก แยกบัญชีร้านกับบัญชีส่วนตัว และบันทึกรายรับ–รายจ่ายทุกวัน',
      resolved: false,
    });
  }
  if (scores[1] < 60) {
    flags.push({
      id: `${storeId}-food-safety`,
      assessmentId,
      type: 'FOOD_SAFETY',
      severity: 'CRITICAL',
      triggerQuestions: [8, 9, 10, 11, 12, 13, 14],
      recommendation: 'จัดทำ Food Safety Action Plan และตรวจสอบใบอนุญาตจำหน่ายอาหารให้ครบ',
      resolved: false,
    });
  }
  if (scores[3] < 65) {
    flags.push({
      id: `${storeId}-market`,
      assessmentId,
      type: 'MARKET',
      severity: 'WARNING',
      triggerQuestions: [21, 22],
      recommendation: 'อัปเดตข้อมูลร้านบน Google Maps และลงคอนเทนต์อาหารอย่างสม่ำเสมอ',
      resolved: false,
    });
  }
  if (scores[5] < 60) {
    flags.push({
      id: `${storeId}-operation`,
      assessmentId,
      type: 'OPERATION',
      severity: 'WARNING',
      triggerQuestions: [35, 36, 39, 41],
      recommendation: 'ทำ SOP เปิด–ปิดร้าน และเริ่มระบบจัดการสต็อกวัตถุดิบเพื่อลดของเสีย',
      resolved: false,
    });
  }

  return flags;
}

const TARGET_ROUND = 'T3';
const TARGET_TOTAL_SCORE = 90;
const TARGET_READINESS = 90;
const TARGET_TOP_PERCENTILE = 10;

/** Rank every fixture store by its T1 weighted total, best first. */
function rankOf(storeId: string): { rank: number; total: number } {
  const stores = storeDb.getAll();
  const ranked = stores
    .map((store) => ({
      id: store.id,
      score: weightedTotal(dimensionScores(store.id, 'T1')),
    }))
    .sort((a, b) => b.score - a.score);

  const index = ranked.findIndex((entry) => entry.id === storeId);
  return { rank: index === -1 ? ranked.length : index + 1, total: ranked.length };
}

export function getStoreAnalytics(
  storeId: string,
  params: Partial<AnalyticsQueryParams>
): StoreAnalytics | null {
  if (!storeDb.findById(storeId)) return null;

  const [from, to] = parseRounds(params.compare ?? 'T0vsT1');
  const fromScores = dimensionScores(storeId, from);
  const toScores = dimensionScores(storeId, to);

  const fromTotal = weightedTotal(fromScores);
  const toTotal = weightedTotal(toScores);
  const rate = improvementRate(fromTotal, toTotal);
  const { rank, total } = rankOf(storeId);
  const readiness = incubationReadiness(storeId, toTotal, rate);

  // The trend always runs the full funnel, independent of the compared pair.
  const trendValues = ROUND_ORDER.map((round) => weightedTotal(dimensionScores(storeId, round)));

  const seed = Number(storeId) || storeId.length;

  return {
    storeId,
    kpis: {
      t0Score: fromTotal,
      t1Score: toTotal,
      improvementRate: rate,
      rankInProject: rank,
      totalStores: total,
      zone: getZone(toTotal),
      incubationReadiness: readiness,
    },
    // Every round, not the compared pair — the API does the same, so both
    // dimension charts draw the whole funnel while the KPIs stay on the pair.
    radar: {
      axes: dimensionSeed.map((dimension) => dimension.name),
      series: ROUND_ORDER.map((round) => ({
        name: SERIES_LABELS[round],
        data: dimensionScores(storeId, round),
        color: SERIES_COLORS[round],
      })),
    },
    trend: {
      xAxis: [...ROUND_ORDER],
      series: [{ name: 'คะแนนรวม', data: trendValues, color: SERIES_COLOR_CURRENT }],
    },
    strengths: topDimensions(toScores, HIGHLIGHT_COUNT, false),
    weaknesses: topDimensions(toScores, HIGHLIGHT_COUNT, true),
    redFlags: buildRedFlags(storeId, toScores),
    target: {
      round: TARGET_ROUND,
      totalScore: TARGET_TOTAL_SCORE,
      incubationReadiness: TARGET_READINESS,
      topPercentile: TARGET_TOP_PERCENTILE,
    },
  };
}

const CSV_BOM = '﻿';

/** Mocks ship CSV; the real API ships XLSX (same as the dashboard export). */
export function toAnalyticsCsv(analytics: StoreAnalytics): string {
  const header = ['มิติ', ...analytics.radar.series.map((series) => series.name)];
  const rows = analytics.radar.axes.map((axis, index) => [
    axis,
    ...analytics.radar.series.map((series) => String(series.data[index] ?? '')),
  ]);
  return `${CSV_BOM}${[header, ...rows].map((cells) => cells.join(',')).join('\n')}`;
}
