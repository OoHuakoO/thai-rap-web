import type { AssessmentQuestion, Dimension } from '../types/assessment.types';

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

// Mirrors computeTotalScore in the API's assessment-scoring.util.ts — each
// dimension's percentage of full marks, weighted by Dimension.weight, with
// unscored questions counting as 0. The API returns this as Assessment
// .currentScore; recomputing it here lets the running total follow each score
// as it is entered, instead of refetching all 50 questions after every save.
export function calcWeightedTotal(
  questions: AssessmentQuestion[],
  dimensions: Dimension[]
): number {
  return dimensions.reduce((total, dim) => {
    const dimQuestions = questions.filter((q) => q.dimensionId === dim.id);
    const { sum, max } = sumQuestionScores(dimQuestions);
    const pct = max === 0 ? 0 : (sum / max) * 100;
    return total + (pct * dim.weight) / 100;
  }, 0);
}
