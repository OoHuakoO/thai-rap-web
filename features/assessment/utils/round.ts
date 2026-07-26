import { ROUND_LABELS, ROUNDS, type AssessmentSummary, type Round } from '../types/assessment.types'

export function isValidRound(round: string): round is Round {
  return round in ROUND_LABELS
}

// Mirrors REQUIRED_PRIOR_ROUND in the API's AssessmentService — the API
// accepts SUBMITTED or APPROVED, so this lock must too.
export const REQUIRED_PRIOR_ROUND: Partial<Record<Round, Round>> = {
  T1: 'T0',
  T2: 'T1',
  T3: 'T1',
}

export function isRoundCompleted(summaries: AssessmentSummary[] | undefined, round: Round): boolean {
  const status = summaries?.find((s) => s.round === round)?.status
  return status === 'SUBMITTED' || status === 'APPROVED'
}

/**
 * The most advanced round this store has actually finished, or null if it has
 * finished none. Store-level figures (rank, dimension scores, weak points) read
 * from this rather than from whichever round is open in the form — a T1 draft
 * with two questions scored must not overwrite the T0 result on display.
 */
export function getLatestCompletedRound(
  summaries: AssessmentSummary[] | undefined
): Round | null {
  for (let i = ROUNDS.length - 1; i >= 0; i -= 1) {
    if (isRoundCompleted(summaries, ROUNDS[i])) return ROUNDS[i]
  }
  return null
}

/** The prior round still blocking `round`, or null if `round` is unlocked. */
export function getMissingPriorRound(
  summaries: AssessmentSummary[] | undefined,
  round: Round
): Round | null {
  const requiredRound = REQUIRED_PRIOR_ROUND[round]
  if (!requiredRound) return null
  return isRoundCompleted(summaries, requiredRound) ? null : requiredRound
}
