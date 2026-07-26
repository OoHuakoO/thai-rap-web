import { describe, it, expect } from 'vitest';
import { calcWeightedTotal, sumQuestionScores } from './dimension-score';
import type { AssessmentQuestion, Dimension } from '../types/assessment.types';

function makeQuestion(overrides: Partial<AssessmentQuestion> = {}): AssessmentQuestion {
  return {
    questionId: 1,
    questionNo: 1,
    dimensionId: 1,
    questionText: 'คำถามตัวอย่าง',
    maxScore: 4,
    rawScore: null,
    note: null,
    suggestion: null,
    evidence: [],
    ...overrides,
  };
}

describe('sumQuestionScores', () => {
  it('sums rawScore and maxScore across questions', () => {
    const questions = [
      makeQuestion({ questionId: 1, rawScore: 3, maxScore: 4 }),
      makeQuestion({ questionId: 2, rawScore: 2, maxScore: 4 }),
    ];
    expect(sumQuestionScores(questions)).toEqual({ sum: 5, max: 8 });
  });

  it('treats an unscored question (rawScore null) as 0 toward the sum', () => {
    const questions = [
      makeQuestion({ questionId: 1, rawScore: null, maxScore: 4 }),
      makeQuestion({ questionId: 2, rawScore: 4, maxScore: 4 }),
    ];
    expect(sumQuestionScores(questions)).toEqual({ sum: 4, max: 8 });
  });

  it('sums each question maxScore individually instead of assuming a fixed 4', () => {
    const questions = [
      makeQuestion({ questionId: 1, rawScore: 1, maxScore: 2 }),
      makeQuestion({ questionId: 2, rawScore: 3, maxScore: 5 }),
    ];
    expect(sumQuestionScores(questions)).toEqual({ sum: 4, max: 7 });
  });

  it('returns zero for an empty question list', () => {
    expect(sumQuestionScores([])).toEqual({ sum: 0, max: 0 });
  });
});

describe('calcWeightedTotal', () => {
  const dimensions: Dimension[] = [
    { id: 1, name: 'มิติ 1', nameEn: 'Dimension 1', weight: 30, questionCount: 1 },
    { id: 2, name: 'มิติ 2', nameEn: 'Dimension 2', weight: 70, questionCount: 1 },
  ];

  it('weights each dimension percentage by its weight', () => {
    const questions = [
      makeQuestion({ questionId: 1, dimensionId: 1, rawScore: 4 }),
      makeQuestion({ questionId: 2, dimensionId: 2, rawScore: 2 }),
    ];
    // 100% × 0.30 + 50% × 0.70
    expect(calcWeightedTotal(questions, dimensions)).toBe(65);
  });

  it('counts unscored questions as 0 so the total converges on the submitted score', () => {
    const questions = [
      makeQuestion({ questionId: 1, dimensionId: 1, rawScore: 4 }),
      makeQuestion({ questionId: 2, dimensionId: 2, rawScore: null }),
    ];
    expect(calcWeightedTotal(questions, dimensions)).toBe(30);
  });

  it('returns zero when a dimension has no questions at all', () => {
    expect(calcWeightedTotal([], dimensions)).toBe(0);
  });
});
