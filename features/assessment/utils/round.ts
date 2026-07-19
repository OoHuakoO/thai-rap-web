import { ROUND_LABELS, type AssessmentSummary, type Round } from '../types/assessment.types'

export function isValidRound(round: string): round is Round {
  return round in ROUND_LABELS
}

// Mirrors REQUIRED_PRIOR_ROUND in the API's AssessmentService — the API
// accepts SUBMITTED or APPROVED, so this lock must too.
export const REQUIRED_PRIOR_ROUND: Partial<Record<Round, Round>> = {
  T1: 'T0',
  T2: 'T1',
  T3: 'T1',
  T4: 'T1',
}

export function isRoundCompleted(summaries: AssessmentSummary[] | undefined, round: Round): boolean {
  const status = summaries?.find((s) => s.round === round)?.status
  return status === 'SUBMITTED' || status === 'APPROVED'
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
