import type { AssessmentQuestion } from '../types/assessment.types';

export interface QuestionScoreSum {
  sum: number;
  max: number;
}

// Sums each question's own maxScore from the API instead of assuming every
// question is worth a hardcoded 4 points — the schema supports a variable
// max per question, so the total must reflect that.
export function sumQuestionScores(questions: AssessmentQuestion[]): QuestionScoreSum {
  return {
    sum: questions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0),
    max: questions.reduce((acc, q) => acc + q.maxScore, 0),
  };
}

// Guards the div-by-zero case (no questions scored yet) shared by every
// sum/max → percentage display in this feature.
export function calcScorePercent(sum: number, max: number, decimals = 0): number {
  if (max === 0) return 0;
  const factor = 10 ** decimals;
  return Math.round((sum / max) * 100 * factor) / factor;
}
