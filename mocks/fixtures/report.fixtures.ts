import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type {
  OverviewReport,
  ReportDimensionDetail,
  ReportDimensionScore,
  RoundMatrixReport,
  RoundMatrixRow,
  RoundReport,
} from '@/features/report/types/report.types';
import { STORE_UNSPECIFIED_LABEL } from '@/constants';
import { storeDb } from './store.fixtures';

const DIMENSIONS = [
  { dimensionId: 1, dimensionName: 'ความปลอดภัยอาหาร', weight: 14, questionCount: 7 },
  { dimensionId: 2, dimensionName: 'คุณภาพอาหารและเมนู', weight: 14, questionCount: 7 },
  { dimensionId: 3, dimensionName: 'การตลาดและลูกค้า', weight: 12, questionCount: 6 },
  { dimensionId: 4, dimensionName: 'การเงินและต้นทุน', weight: 16, questionCount: 7 },
  { dimensionId: 5, dimensionName: 'การบริหารจัดการร้าน', weight: 14, questionCount: 7 },
  { dimensionId: 6, dimensionName: 'บุคลากรและบริการ', weight: 12, questionCount: 7 },
  { dimensionId: 7, dimensionName: 'ความพร้อมของเจ้าของ', weight: 10, questionCount: 5 },
  { dimensionId: 8, dimensionName: 'โอกาสเติบโต', weight: 8, questionCount: 4 },
];

const MAX_SCORE_PER_QUESTION = 4;

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
    dimensionId: dimension.dimensionId,
    dimensionName: dimension.dimensionName,
    weight: dimension.weight,
    scorePct: scoreFor(storeId, round, dimension.dimensionId),
  }));
}

/** The question number each dimension starts at — Q1–Q50 run continuously. */
function firstQuestionNo(dimensionId: number): number {
  return (
    DIMENSIONS.filter((dimension) => dimension.dimensionId < dimensionId).reduce(
      (sum, dimension) => sum + dimension.questionCount,
      0
    ) + 1
  );
}

// The per-question scores are derived from the dimension percentage so the
// two agree: a dimension at 75% shows questions that really do add up to 75%.
function detailedDimensionsFor(storeId: string, round: AssessmentRound): ReportDimensionDetail[] {
  return DIMENSIONS.map((dimension) => {
    const scorePct = scoreFor(storeId, round, dimension.dimensionId);
    const maxScore = dimension.questionCount * MAX_SCORE_PER_QUESTION;
    const target = Math.round((scorePct / 100) * maxScore);
    const start = firstQuestionNo(dimension.dimensionId);

    let remaining = target;
    const questions = Array.from({ length: dimension.questionCount }, (_, index) => {
      const rawScore = Math.min(MAX_SCORE_PER_QUESTION, remaining);
      remaining -= rawScore;
      return {
        questionNo: start + index,
        questionText: `ข้อ ${start + index} ของมิติ${dimension.dimensionName}`,
        rawScore,
        maxScore: MAX_SCORE_PER_QUESTION,
      };
    });

    const rawScore = questions.reduce((sum, question) => sum + question.rawScore, 0);

    return {
      dimensionId: dimension.dimensionId,
      dimensionName: dimension.dimensionName,
      weight: dimension.weight,
      scorePct: Math.round((rawScore / maxScore) * 10000) / 100,
      rawScore,
      maxScore,
      weightedScore: Math.round((rawScore / maxScore) * dimension.weight * 100) / 100,
      questions,
    };
  });
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
    province: store.province ?? STORE_UNSPECIFIED_LABEL,
    storeType: store.storeType ?? STORE_UNSPECIFIED_LABEL,
    ownerName: store.ownerName ?? STORE_UNSPECIFIED_LABEL,
  };
}

export function buildRoundReport(storeId: string, round: AssessmentRound): RoundReport | null {
  const store = reportStore(storeId);
  if (!store || !assessedRounds(storeId).includes(round)) return null;

  const dimensions = detailedDimensionsFor(storeId, round);
  const totalScore = weightedTotal(dimensions);
  const rawScore = dimensions.reduce((sum, dimension) => sum + dimension.rawScore, 0);
  const maxScore = dimensions.reduce((sum, dimension) => sum + dimension.maxScore, 0);

  return {
    store,
    round,
    totalScore,
    zone: zoneOf(totalScore),
    assessorName: 'นายสมชาย วงษ์สมบัติ',
    submittedAt: '2026-05-20T00:00:00.000Z',
    notes: 'ผลการประเมินอ้างอิงจากการลงพื้นที่จริง',
    rawScore,
    maxScore,
    rawScorePct: Math.round((rawScore / maxScore) * 10000) / 100,
    completionPct: 100,
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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Every store that "submitted" this round, one row each. */
export function buildRoundMatrix(round: AssessmentRound): RoundMatrixReport {
  const rows: RoundMatrixRow[] = storeDb
    .getAll()
    .filter((store) => assessedRounds(store.id).includes(round))
    .map((store) => {
      const dimensions = detailedDimensionsFor(store.id, round);
      const weightedScore = weightedTotal(dimensions);
      const rawScore = dimensions.reduce((sum, dimension) => sum + dimension.rawScore, 0);
      const maxScore = dimensions.reduce((sum, dimension) => sum + dimension.maxScore, 0);
      const critical = dimensions.reduce((lowest, dimension) =>
        dimension.scorePct < lowest.scorePct ? dimension : lowest
      );

      return {
        storeId: store.id,
        storeCode: store.code,
        storeName: store.name,
        province: store.province ?? STORE_UNSPECIFIED_LABEL,
        completionPct: 100,
        rawScore,
        rawScorePct: round2((rawScore / maxScore) * 100),
        weightedScore,
        zone: zoneOf(weightedScore),
        redFlagCount: round === 'T0' ? 1 : 0,
        unresolvedRedFlagCount: round === 'T0' ? 1 : 0,
        criticalDimensionId: critical.dimensionId,
        criticalDimensionName: critical.dimensionName,
        scoresByDimension: Object.fromEntries(
          dimensions.map((dimension) => [dimension.dimensionId, dimension.scorePct])
        ),
      };
    });

  const averageByDimension = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension.dimensionId,
      round2(
        rows.reduce((sum, row) => sum + (row.scoresByDimension[dimension.dimensionId] ?? 0), 0) /
          (rows.length || 1)
      ),
    ])
  );

  return {
    round,
    dimensions: DIMENSIONS.map((dimension) => ({
      dimensionId: dimension.dimensionId,
      dimensionName: dimension.dimensionName,
      weight: dimension.weight,
    })),
    rows,
    averageByDimension: rows.length === 0 ? {} : averageByDimension,
    averageWeightedScore:
      rows.length === 0
        ? null
        : round2(rows.reduce((sum, row) => sum + (row.weightedScore ?? 0), 0) / rows.length),
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
