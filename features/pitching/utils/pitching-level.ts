import { PITCHING_LEVEL_THRESHOLDS } from '../constants/pitching.constants';
import type { PitchingCriterionScore, PitchingLevel } from '../types/pitching.types';

export interface PitchingScoreProgress {
  /** Σ of the scores filled in so far. */
  total: number;
  /** Σ maxScore of every criterion on this form — 100 on both paper forms. */
  maxTotal: number;
  scoredCount: number;
  criteriaCount: number;
  /** The band `total` currently falls in. */
  level: PitchingLevel;
  isComplete: boolean;
}

/**
 * The band a total falls in. Mirrors `getPitchingLevel()` on the API
 * (`pitching-scoring.util.ts`) — both forms share the same cut points, and the
 * API is the authority for the score a submitted form is finally filed under.
 */
export function getPitchingLevel(score: number): PitchingLevel {
  if (score >= PITCHING_LEVEL_THRESHOLDS.HIGHLY_SUITABLE) return 'HIGHLY_SUITABLE';
  if (score >= PITCHING_LEVEL_THRESHOLDS.SUITABLE) return 'SUITABLE';
  if (score >= PITCHING_LEVEL_THRESHOLDS.FAIR) return 'FAIR';
  return 'NOT_READY';
}

/**
 * The running total of a form being filled in. An unscored row counts as 0, so
 * the level of a half-filled form only ever understates the final one — which
 * is why the caller flags an incomplete form rather than presenting the band
 * as a verdict.
 */
export function summarizePitchingScore(criteria: PitchingCriterionScore[]): PitchingScoreProgress {
  let total = 0;
  let maxTotal = 0;
  let scoredCount = 0;

  for (const criterion of criteria) {
    maxTotal += criterion.maxScore;
    if (criterion.score === null) continue;
    total += criterion.score;
    scoredCount += 1;
  }

  return {
    total,
    maxTotal,
    scoredCount,
    criteriaCount: criteria.length,
    level: getPitchingLevel(total),
    isComplete: criteria.length > 0 && scoredCount === criteria.length,
  };
}
