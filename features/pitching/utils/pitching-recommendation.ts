import type { PitchingRecommendation, PitchingRecommendationCounts } from '../types/pitching.types';

// Declaration order is the tie-break: judges split evenly between two verdicts
// resolve to the more favourable one, matching how the committee reads a tied
// panel (the paper form's สำรอง sits above ไม่เห็นควร, not beside it).
const RECOMMENDATION_PRIORITY: readonly PitchingRecommendation[] = [
  'SELECTED',
  'WAITING_LIST',
  'MINIMUM_NOT_MET',
  'NOT_SELECTED',
];

/**
 * The panel's majority verdict, or null when no judge has recorded one.
 * `recommendationCounts` only ever counts submitted forms, so a store still
 * being scored answers null rather than a verdict nobody has cast.
 */
export function pickMajorityRecommendation(
  counts: PitchingRecommendationCounts
): PitchingRecommendation | null {
  let winner: PitchingRecommendation | null = null;

  for (const recommendation of RECOMMENDATION_PRIORITY) {
    const count = counts[recommendation];
    if (count > 0 && (winner === null || count > counts[winner])) {
      winner = recommendation;
    }
  }

  return winner;
}
