import { describe, it, expect } from 'vitest';
import { buildOverallSummary, type CompletedRoundInput } from './overall-summary';
import type { AssessmentQuestion, Dimension, Round } from '../types/assessment.types';

const dimensions: Dimension[] = [
  { id: 1, name: 'มิติ 1', nameEn: 'Dimension 1', weight: 40, questionCount: 2 },
  { id: 2, name: 'มิติ 2', nameEn: 'Dimension 2', weight: 60, questionCount: 2 },
];

function makeQuestion(
  questionId: number,
  dimensionId: number,
  rawScore: number | null
): AssessmentQuestion {
  return {
    questionId,
    questionNo: questionId,
    dimensionId,
    questionText: `คำถามที่ ${questionId}`,
    maxScore: 4,
    rawScore,
    note: null,
    suggestion: null,
    evidence: [],
  };
}

// Two questions per dimension, every one worth 4 — so a dimension scored [s, s]
// lands at (2s / 8) × 100 percent.
function makeRound(round: Round, dim1: number, dim2: number, totalScore: number | null) {
  const entry: CompletedRoundInput = {
    round,
    totalScore,
    questions: [
      makeQuestion(1, 1, dim1),
      makeQuestion(2, 1, dim1),
      makeQuestion(3, 2, dim2),
      makeQuestion(4, 2, dim2),
    ],
  };
  return entry;
}

describe('buildOverallSummary', () => {
  it('returns null when no round has been finished', () => {
    expect(buildOverallSummary([], dimensions)).toBeNull();
  });

  it('returns null when the dimensions have not loaded', () => {
    expect(buildOverallSummary([makeRound('T0', 2, 3, 65)], [])).toBeNull();
  });

  it('keeps each round percentage alongside the pooled average per dimension', () => {
    const summary = buildOverallSummary(
      [makeRound('T0', 2, 2, 50), makeRound('T1', 4, 3, 87.5)],
      dimensions
    );

    expect(summary?.dimensions[0].pctByRound).toEqual({ T0: 50, T1: 100 });
    expect(summary?.dimensions[0].avgPct).toBe(75);
    expect(summary?.dimensions[1].pctByRound).toEqual({ T0: 50, T1: 75 });
    expect(summary?.dimensions[1].avgPct).toBe(62.5);
  });

  it('averages the frozen total score across the finished rounds', () => {
    const summary = buildOverallSummary(
      [makeRound('T0', 2, 2, 50), makeRound('T1', 4, 3, 90)],
      dimensions
    );

    expect(summary?.averageTotalScore).toBe(70);
    expect(summary?.roundTotals).toEqual([
      { round: 'T0', totalScore: 50 },
      { round: 'T1', totalScore: 90 },
    ]);
  });

  // A round finished before the score was frozen must not average in as a 0.
  it('recomputes the weighted total for a round whose totalScore is null', () => {
    const summary = buildOverallSummary([makeRound('T0', 2, 4, null)], dimensions);

    // 50% × 40 weight + 100% × 60 weight = 80
    expect(summary?.averageTotalScore).toBe(80);
  });

  it('counts every dimension once in the unweighted dimension average', () => {
    const summary = buildOverallSummary([makeRound('T0', 2, 4, 80)], dimensions);

    // 50% and 100% — the 40/60 weights do not apply to this figure.
    expect(summary?.averageDimensionPct).toBe(75);
  });

  it('marks a dimension with no questions in the round as null rather than 0%', () => {
    const summary = buildOverallSummary(
      [{ round: 'T0', totalScore: 40, questions: [makeQuestion(1, 1, 2)] }],
      dimensions
    );

    expect(summary?.dimensions[1].pctByRound.T0).toBeNull();
    expect(summary?.dimensions[1].avgPct).toBe(0);
  });
});
