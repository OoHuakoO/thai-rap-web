import { describe, expect, it } from 'vitest';
import type { AnalyticsKPIs } from '../types/analytics.types';
import {
  formatDelta,
  formatRate,
  formatScore,
  getScoreDelta,
  getTopPercentile,
} from './kpi-format';

function makeKpis(overrides: Partial<AnalyticsKPIs> = {}): AnalyticsKPIs {
  return {
    t0Score: 57.3,
    t1Score: 70.36,
    improvementRate: 22.79,
    rankInProject: 5,
    totalStores: 50,
    zone: 'Improve Zone',
    incubationReadiness: 72.34,
    ...overrides,
  };
}

describe('formatScore', () => {
  it('keeps two decimals when the score has them', () => {
    expect(formatScore(72.34)).toBe('72.34');
  });

  it('drops trailing zeros', () => {
    expect(formatScore(70)).toBe('70');
    expect(formatScore(70.5)).toBe('70.5');
  });
});

describe('formatDelta', () => {
  it('signs a gain', () => {
    expect(formatDelta(13.06)).toBe('+13.06');
  });

  it('leaves a loss with its own minus sign', () => {
    expect(formatDelta(-4)).toBe('-4');
  });

  it('does not sign zero', () => {
    expect(formatDelta(0)).toBe('0');
  });
});

describe('formatRate', () => {
  it('signs and suffixes a gain', () => {
    expect(formatRate(7.96)).toBe('+7.96%');
  });

  it('signs a loss', () => {
    expect(formatRate(-3.5)).toBe('-3.50%');
  });
});

describe('getScoreDelta', () => {
  it('returns the point difference between the two rounds', () => {
    expect(getScoreDelta(makeKpis())).toBeCloseTo(13.06);
  });

  it('returns null when the later round has no score yet', () => {
    expect(getScoreDelta(makeKpis({ t1Score: null }))).toBeNull();
  });

  it('returns null when the baseline has no score', () => {
    expect(getScoreDelta(makeKpis({ t0Score: null }))).toBeNull();
  });
});

describe('getTopPercentile', () => {
  it('returns the rank as a percentage of the field', () => {
    expect(getTopPercentile(makeKpis({ rankInProject: 5, totalStores: 50 }))).toBe(10);
  });

  it('returns null when the store is not ranked', () => {
    expect(getTopPercentile(makeKpis({ rankInProject: null }))).toBeNull();
  });

  it('returns null when the field size is unknown', () => {
    expect(getTopPercentile(makeKpis({ totalStores: 0 }))).toBeNull();
  });
});
