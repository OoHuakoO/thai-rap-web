import { describe, expect, it } from 'vitest';
import type { PitchingRecommendationCounts } from '../types/pitching.types';
import { pickMajorityRecommendation } from './pitching-recommendation';

function counts(
  overrides: Partial<PitchingRecommendationCounts> = {}
): PitchingRecommendationCounts {
  return { SELECTED: 0, WAITING_LIST: 0, MINIMUM_NOT_MET: 0, NOT_SELECTED: 0, ...overrides };
}

describe('pickMajorityRecommendation', () => {
  it('returns the verdict most judges recorded', () => {
    expect(pickMajorityRecommendation(counts({ SELECTED: 1, NOT_SELECTED: 3 }))).toBe(
      'NOT_SELECTED'
    );
  });

  it('breaks a tie in favour of the more favourable verdict', () => {
    expect(pickMajorityRecommendation(counts({ SELECTED: 2, WAITING_LIST: 2 }))).toBe('SELECTED');
    expect(pickMajorityRecommendation(counts({ WAITING_LIST: 1, NOT_SELECTED: 1 }))).toBe(
      'WAITING_LIST'
    );
  });

  it('returns null when no judge has recorded a verdict', () => {
    expect(pickMajorityRecommendation(counts())).toBeNull();
  });
});
