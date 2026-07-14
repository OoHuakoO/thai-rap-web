import { ROUND_LABELS, type Round } from '../types/assessment.types'

export function isValidRound(round: string): round is Round {
  return round in ROUND_LABELS
}
