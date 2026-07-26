import { describe, expect, it } from 'vitest';
import { getIncubationStatus } from './incubation-status';

describe('getIncubationStatus', () => {
  it('returns completed at exactly 100%', () => {
    expect(getIncubationStatus(100)).toBe('completed');
  });

  it('returns completed above 100%', () => {
    expect(getIncubationStatus(120)).toBe('completed');
  });

  it('returns active just below 100%', () => {
    expect(getIncubationStatus(99.99)).toBe('active');
  });

  it('returns active at exactly 50%', () => {
    expect(getIncubationStatus(50)).toBe('active');
  });

  it('returns pending just below 50%', () => {
    expect(getIncubationStatus(49.99)).toBe('pending');
  });

  it('returns pending at 0%', () => {
    expect(getIncubationStatus(0)).toBe('pending');
  });
});
