import { describe, it, expect } from 'vitest';
import { isValidRound, isRoundCompleted, getMissingPriorRound } from './round';
import type { AssessmentSummary, Round } from '../types/assessment.types';

describe('isValidRound', () => {
  it('returns true for each defined round', () => {
    expect(isValidRound('T0')).toBe(true);
    expect(isValidRound('T1')).toBe(true);
    expect(isValidRound('T2')).toBe(true);
    expect(isValidRound('T3')).toBe(true);
    expect(isValidRound('T4')).toBe(true);
  });

  it('returns false for a round that does not exist', () => {
    expect(isValidRound('T5')).toBe(false);
  });

  it('returns false for an empty or lowercase string', () => {
    expect(isValidRound('')).toBe(false);
    expect(isValidRound('t0')).toBe(false);
  });
});

function makeSummary(round: Round, status: AssessmentSummary['status']): AssessmentSummary {
  return {
    id: 'a1',
    storeId: 'store-1',
    round,
    assessorId: 'assessor-1',
    status,
    totalScore: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    submittedAt: null,
  };
}

describe('isRoundCompleted', () => {
  it('returns true when the round is SUBMITTED', () => {
    expect(isRoundCompleted([makeSummary('T0', 'SUBMITTED')], 'T0')).toBe(true);
  });

  it('returns true when the round is APPROVED', () => {
    expect(isRoundCompleted([makeSummary('T0', 'APPROVED')], 'T0')).toBe(true);
  });

  it('returns false when the round is only DRAFT or IN_PROGRESS', () => {
    expect(isRoundCompleted([makeSummary('T0', 'DRAFT')], 'T0')).toBe(false);
    expect(isRoundCompleted([makeSummary('T0', 'IN_PROGRESS')], 'T0')).toBe(false);
  });

  it('returns false when there is no summary for the round at all', () => {
    expect(isRoundCompleted([], 'T0')).toBe(false);
    expect(isRoundCompleted(undefined, 'T0')).toBe(false);
  });
});

describe('getMissingPriorRound', () => {
  it('returns null for T0, which has no prior round', () => {
    expect(getMissingPriorRound(undefined, 'T0')).toBeNull();
  });

  it('returns T0 for T1 when T0 has not been submitted yet', () => {
    expect(getMissingPriorRound([], 'T1')).toBe('T0');
    expect(getMissingPriorRound([makeSummary('T0', 'DRAFT')], 'T1')).toBe('T0');
  });

  it('returns null for T1 once T0 is SUBMITTED or APPROVED', () => {
    expect(getMissingPriorRound([makeSummary('T0', 'SUBMITTED')], 'T1')).toBeNull();
    expect(getMissingPriorRound([makeSummary('T0', 'APPROVED')], 'T1')).toBeNull();
  });

  it('requires T1 (not T0) to be completed before T2/T3/T4', () => {
    expect(getMissingPriorRound([makeSummary('T0', 'SUBMITTED')], 'T2')).toBe('T1');
    expect(
      getMissingPriorRound([makeSummary('T0', 'SUBMITTED'), makeSummary('T1', 'SUBMITTED')], 'T2')
    ).toBeNull();
  });
});
