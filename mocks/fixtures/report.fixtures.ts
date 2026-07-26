import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type {
  OverviewReport,
  ReportDimensionScore,
  RoundReport,
} from '@/features/report/types/report.types';
import { storeDb } from './store.fixtures';

const DIMENSIONS = [
  { dimensionId: 1, dimensionName: 'ความปลอดภัยอาหาร', weight: 14 },
  { dimensionId: 2, dimensionName: 'คุณภาพอาหารและเมนู', weight: 14 },
  { dimensionId: 3, dimensionName: 'การตลาดและลูกค้า', weight: 12 },
  { dimensionId: 4, dimensionName: 'การเงินและต้นทุน', weight: 16 },
  { dimensionId: 5, dimensionName: 'การบริหารจัดการร้าน', weight: 14 },
  { dimensionId: 6, dimensionName: 'บุคลากรและบริการ', weight: 12 },
  { dimensionId: 7, dimensionName: 'ความพร้อมของเจ้าของ', weight: 10 },
  { dimensionId: 8, dimensionName: 'โอกาสเติบโต', weight: 8 },
];

// Deterministic per store+round+dimension, so a report looks the same on every
// reload and the T0→T3 trend reads as steady improvement.
function scoreFor(storeId: string, round: AssessmentRound, dimensionId: number): number {
  const seed = [...storeId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const roundIndex = ROUND_ORDER.indexOf(round);
  const base = 52 + ((seed + dimensionId * 7) % 18);
  return Math.round((base + roundIndex * 5.5) * 100) / 100;
}

const ROUND_ORDER: AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

function dimensionsFor(storeId: string, round: AssessmentRound): ReportDimensionScore[] {
  return DIMENSIONS.map((dimension) => ({
    ...dimension,
    scorePct: scoreFor(storeId, round, dimension.dimensionId),
  }));
}

function weightedTotal(dimensions: ReportDimensionScore[]): number {
  const total = dimensions.reduce((sum, d) => sum + (d.scorePct * d.weight) / 100, 0);
  return Math.round(total * 100) / 100;
}

function zoneOf(score: number): string {
  if (score < 40) return 'Red Zone';
  if (score < 60) return 'Survival Zone';
  if (score < 75) return 'Improve Zone';
  if (score < 85) return 'Growth Zone';
  return 'Model Zone';
}

/** Which rounds a store has "submitted" — derived from its id so it varies. */
export function assessedRounds(storeId: string): AssessmentRound[] {
  const seed = [...storeId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = 1 + (seed % ROUND_ORDER.length);
  return ROUND_ORDER.slice(0, count);
}

function reportStore(storeId: string) {
  const store = storeDb.findById(storeId);
  if (!store) return null;
  return {
    id: store.id,
    name: store.name,
    province: store.province,
    storeType: store.storeType,
    ownerName: store.ownerName,
  };
}

export function buildRoundReport(storeId: string, round: AssessmentRound): RoundReport | null {
  const store = reportStore(storeId);
  if (!store || !assessedRounds(storeId).includes(round)) return null;

  const dimensions = dimensionsFor(storeId, round);
  const totalScore = weightedTotal(dimensions);

  return {
    store,
    round,
    totalScore,
    zone: zoneOf(totalScore),
    assessorName: 'นายสมชาย วงษ์สมบัติ',
    submittedAt: '2026-05-20T00:00:00.000Z',
    notes: 'ผลการประเมินอ้างอิงจากการลงพื้นที่จริง',
    dimensions,
    redFlags:
      round === 'T0'
        ? [
            {
              type: 'FINANCIAL',
              severity: 'CRITICAL',
              triggerQuestions: [28, 29],
              resolved: false,
            },
          ]
        : [],
  };
}

export function buildOverviewReport(storeId: string): OverviewReport | null {
  const store = reportStore(storeId);
  if (!store) return null;

  const rounds = assessedRounds(storeId);

  let previous: number | null = null;
  const summaries = rounds.map((round) => {
    const totalScore = weightedTotal(dimensionsFor(storeId, round));
    const delta = previous === null ? null : Math.round((totalScore - previous) * 100) / 100;
    previous = totalScore;
    return {
      round,
      totalScore,
      zone: zoneOf(totalScore),
      delta,
      submittedAt: '2026-05-20T00:00:00.000Z',
    };
  });

  return {
    store,
    rounds: summaries,
    dimensionTrends: DIMENSIONS.map((dimension) => ({
      ...dimension,
      scoresByRound: Object.fromEntries(
        rounds.map((round) => [round, scoreFor(storeId, round, dimension.dimensionId)])
      ) as Partial<Record<AssessmentRound, number>>,
    })),
    unresolvedRedFlagCount: rounds.includes('T0') ? 1 : 0,
  };
}
