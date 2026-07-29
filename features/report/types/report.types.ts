import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type { PaginationMeta } from '@/types/api.types';

export type ReportFileFormat = 'xlsx' | 'pdf';

export interface ReportStore {
  id: string;
  name: string;
  province: string;
  storeType: string;
  ownerName: string;
}

export interface ReportDimensionScore {
  dimensionId: number;
  dimensionName: string;
  weight: number;
  scorePct: number;
}

export interface ReportQuestionScore {
  questionNo: number;
  questionText: string;
  /** null when the assessor left the question unanswered. */
  rawScore: number | null;
  maxScore: number;
}

/** A dimension plus the arithmetic behind its weighted contribution. */
export interface ReportDimensionDetail extends ReportDimensionScore {
  rawScore: number;
  maxScore: number;
  weightedScore: number;
  questions: ReportQuestionScore[];
}

export interface ReportRedFlag {
  type: string;
  severity: 'WARNING' | 'CRITICAL';
  triggerQuestions: number[];
  resolved: boolean;
}

export interface RoundReport {
  store: ReportStore;
  round: AssessmentRound;
  /** The weighted total — คะแนนถ่วงน้ำหนัก. */
  totalScore: number | null;
  zone: string | null;
  assessorName: string;
  submittedAt: string | null;
  notes: string | null;
  rawScore: number;
  maxScore: number;
  rawScorePct: number;
  completionPct: number;
  dimensions: ReportDimensionDetail[];
  redFlags: ReportRedFlag[];
}

export interface OverviewRoundSummary {
  round: AssessmentRound;
  totalScore: number | null;
  zone: string | null;
  delta: number | null;
  submittedAt: string | null;
}

export interface OverviewDimensionTrend {
  dimensionId: number;
  dimensionName: string;
  weight: number;
  scoresByRound: Partial<Record<AssessmentRound, number>>;
}

export interface OverviewReport {
  store: ReportStore;
  rounds: OverviewRoundSummary[];
  dimensionTrends: OverviewDimensionTrend[];
  unresolvedRedFlagCount: number;
}

export interface RoundMatrixDimension {
  dimensionId: number;
  dimensionName: string;
  weight: number;
}

export interface RoundMatrixRow {
  storeId: string;
  storeCode: string;
  storeName: string;
  province: string;
  completionPct: number;
  rawScore: number;
  rawScorePct: number;
  weightedScore: number | null;
  /** ระดับรวม — a Thai label over the weighted total, on its own scale, not Zone. */
  overallLevel: string;
  redFlagCount: number;
  unresolvedRedFlagCount: number;
  criticalDimensionId: number | null;
  criticalDimensionName: string | null;
  scoresByDimension: Record<number, number>;
}

export interface RoundMatrixQueryParams {
  page?: number;
  limit?: number;
}

/** Every accessible store's dimension scores for one round, side by side. */
export interface RoundMatrixReport {
  round: AssessmentRound;
  dimensions: RoundMatrixDimension[];
  /** One page of stores — `meta.total` is how many the round has in all. */
  rows: RoundMatrixRow[];
  /** Over every store in the round, not the page, so paging never moves them. */
  averageByDimension: Record<number, number>;
  averageWeightedScore: number | null;
  meta: PaginationMeta;
}
