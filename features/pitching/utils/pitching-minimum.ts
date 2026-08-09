import {
  PITCHING_PARTICIPATION_MIN_PASS,
  PITCHING_SCORE_CARD_MIN_PASS,
} from '../constants/pitching.constants';
import type { PitchingMinimumConditions } from '../types/pitching.types';

// Mirrors evaluateMinimumConditions on the API — an unrecorded reading counts as
// failed. The form buffers every field until submit, so the ผ่าน/ไม่ผ่าน badges
// have to be derived here; the server's copy is a submit behind what is typed.
export function evaluateMinimumConditions(
  scoreCardTotal: number | null,
  participationPct: number | null
): PitchingMinimumConditions {
  const scoreCardPassed = scoreCardTotal !== null && scoreCardTotal >= PITCHING_SCORE_CARD_MIN_PASS;
  const participationPassed =
    participationPct !== null && participationPct >= PITCHING_PARTICIPATION_MIN_PASS;

  return {
    scoreCardTotal,
    participationPct,
    scoreCardPassed,
    participationPassed,
    passed: scoreCardPassed && participationPassed,
  };
}
