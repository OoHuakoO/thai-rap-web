// Mirrors the API's Prisma enums and PitchingService result types
// (thai-rap-api/spec/09-pitching.md). Change both repos together.

export const PITCHING_ROUNDS = ['PITCH_DECK', 'ACCELERATION'] as const;
export type PitchingRound = (typeof PITCHING_ROUNDS)[number];

export type PitchingStatus = 'DRAFT' | 'SUBMITTED';

export type PitchingRecommendation =
  | 'SELECTED'
  | 'WAITING_LIST'
  | 'MINIMUM_NOT_MET'
  | 'NOT_SELECTED';

// Not a Prisma enum — the API derives it from the total, both forms sharing the
// same 80 / 70 / 60 cut points.
export type PitchingLevel = 'HIGHLY_SUITABLE' | 'SUITABLE' | 'FAIR' | 'NOT_READY';

export interface PitchingCriterion {
  id: number;
  round: PitchingRound;
  /** As printed on the paper form: "1".."10", or "1.1".."5.4". */
  code: string;
  /** "A" / "B" on the acceleration form; null on the pitch deck form. */
  section: string | null;
  title: string;
  guideline: string;
  maxScore: number;
  sortOrder: number;
}

export interface PitchingCriterionScore extends PitchingCriterion {
  score: number | null;
  note: string | null;
}

export interface PitchingMinimumConditions {
  scoreCardTotal: number | null;
  participationPct: number | null;
  scoreCardPassed: boolean;
  participationPassed: boolean;
  passed: boolean;
}

export interface PitchingSummaryRow {
  id: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  province: string | null;
  round: PitchingRound;
  judgeId: string;
  judgeName: string;
  status: PitchingStatus;
  /** Frozen at submit; null while the form is a draft. */
  totalScore: number | null;
  /** Σ of what is scored right now — what a draft shows. */
  currentScore: number;
  level: PitchingLevel | null;
  recommendation: PitchingRecommendation | null;
  evaluatedAt: string | null;
  updatedAt: string;
  submittedAt: string | null;
}

export interface Pitching extends PitchingSummaryRow {
  prototypeProduct: string | null;
  /** ACCELERATION only — null on the pitch deck form. */
  minimumConditions: PitchingMinimumConditions | null;
  evidenceChecked: string[];
  comments: Record<string, string>;
  recommendationReason: string | null;
  noConflictOfInterest: boolean;
  createdAt: string;
  criteria: PitchingCriterionScore[];
}

export interface PitchingRecommendationCounts {
  SELECTED: number;
  WAITING_LIST: number;
  MINIMUM_NOT_MET: number;
  NOT_SELECTED: number;
}

export interface PitchingRankingRow {
  storeId: string;
  storeCode: string;
  storeName: string;
  province: string | null;
  /** Storefront photo for the ranking's thumbnail; null when none is uploaded. */
  coverUrl: string | null;
  rank: number;
  judgeCount: number;
  avgScore: number;
  level: PitchingLevel;
  recommendationCounts: PitchingRecommendationCounts;
  /**
   * How many judges recorded both minimum conditions as met. Null on
   * PITCH_DECK — that form has no minimum conditions, so the column is dropped
   * rather than printing "0 / n" for a gate nobody could fail.
   */
  minimumPassedCount: number | null;
}

export interface PitchingCriterionAverage extends PitchingCriterion {
  avgScore: number;
  avgPct: number;
}

export interface PitchingStoreReport {
  storeId: string;
  storeCode: string;
  storeName: string;
  province: string | null;
  round: PitchingRound;
  avgScore: number | null;
  level: PitchingLevel | null;
  rank: number | null;
  rankedStoreCount: number;
  judgeCount: number;
  recommendationCounts: PitchingRecommendationCounts;
  criteria: PitchingCriterionAverage[];
  judges: Pitching[];
}

export interface CreatePitchingDto {
  storeId: string;
  round: PitchingRound;
}

// The header fields (judge, evaluatedAt, prototypeProduct) are absent on
// purpose — the API stamps them and rejects them on this payload.
export interface UpdatePitchingDto {
  // Nullable, not merely optional — sending null clears the reading, omitting
  // the key leaves it alone. Mirrors UpdatePitchingDto on the API.
  scoreCardTotal?: number | null;
  participationPct?: number | null;
  evidenceChecked?: string[];
  comments?: Record<string, string>;
  recommendation?: PitchingRecommendation;
  recommendationReason?: string;
  noConflictOfInterest?: boolean;
}

export interface UpdatePitchingScoreDto {
  score?: number | null;
  note?: string;
}

export interface SubmitPitchingScoreDto extends UpdatePitchingScoreDto {
  criterionId: number;
}

// The judge fills the form offline and hands it in once, so submit carries the
// whole form. An omitted key keeps whatever is stored — mirrors the API's
// SubmitPitchingDto.
export interface SubmitPitchingDto extends UpdatePitchingDto {
  scores?: SubmitPitchingScoreDto[];
}
