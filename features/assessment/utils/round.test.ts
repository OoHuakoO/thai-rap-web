import { describe, it, expect } from 'vitest';
import { isValidRound } from './round';

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
