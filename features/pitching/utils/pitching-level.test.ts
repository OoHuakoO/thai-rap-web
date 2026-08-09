import { describe, expect, it } from 'vitest';
import type { PitchingCriterionScore } from '../types/pitching.types';
import { getPitchingLevel, summarizePitchingScore } from './pitching-level';

function criterion(overrides: Partial<PitchingCriterionScore> = {}): PitchingCriterionScore {
  return {
    id: 1,
    round: 'PITCH_DECK',
    code: '1',
    section: null,
    title: 'แนะนำร้าน',
    guideline: '',
    maxScore: 10,
    sortOrder: 1,
    score: null,
    note: null,
    ...overrides,
  };
}

describe('getPitchingLevel', () => {
  it.each([
    [100, 'HIGHLY_SUITABLE'],
    [80, 'HIGHLY_SUITABLE'],
    [79, 'SUITABLE'],
    [70, 'SUITABLE'],
    [69, 'FAIR'],
    [60, 'FAIR'],
    [59, 'NOT_READY'],
    [0, 'NOT_READY'],
  ])('puts %i in the %s band', (score, level) => {
    expect(getPitchingLevel(score)).toBe(level);
  });
});

describe('summarizePitchingScore', () => {
  it('sums the scores filled in so far', () => {
    const result = summarizePitchingScore([
      criterion({ id: 1, score: 8 }),
      criterion({ id: 2, score: 7 }),
    ]);

    expect(result.total).toBe(15);
    expect(result.maxTotal).toBe(20);
    expect(result.scoredCount).toBe(2);
    expect(result.isComplete).toBe(true);
  });

  // An unscored row is not a zero the judge chose — the band it produces is a
  // running figure, which is why the form flags the form as incomplete.
  it('counts an unscored criterion as zero and reports the form incomplete', () => {
    const result = summarizePitchingScore([
      criterion({ id: 1, score: 8 }),
      criterion({ id: 2, score: null }),
    ]);

    expect(result.total).toBe(8);
    expect(result.scoredCount).toBe(1);
    expect(result.criteriaCount).toBe(2);
    expect(result.isComplete).toBe(false);
  });

  it('reads an empty criteria list as an empty, incomplete form', () => {
    expect(summarizePitchingScore([])).toEqual({
      total: 0,
      maxTotal: 0,
      scoredCount: 0,
      criteriaCount: 0,
      level: 'NOT_READY',
      isComplete: false,
    });
  });
});
