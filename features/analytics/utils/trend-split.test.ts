import { describe, expect, it } from 'vitest';
import type { TrendSeries } from '../types/analytics.types';
import { splitMeasuredAndProjected } from './trend-split';

const xAxis = ['T0', 'T1', 'T2 (เป้าหมาย)', 'T3 (เป้าหมาย)'];

function makeSeries(overrides: Partial<TrendSeries> = {}): TrendSeries {
  return { name: 'คะแนนรวม', data: [57.3, 70.36, 78, 85], ...overrides };
}

describe('splitMeasuredAndProjected', () => {
  it('marks points before the boundary as measured only', () => {
    const points = splitMeasuredAndProjected(xAxis, makeSeries({ actualCount: 2 }));
    expect(points[0]).toEqual({
      label: 'T0',
      measured: 57.3,
      projected: null,
      projectedLabel: null,
    });
  });

  it('repeats the boundary point on both series so the lines meet', () => {
    const points = splitMeasuredAndProjected(xAxis, makeSeries({ actualCount: 2 }));
    expect(points[1].measured).toBe(70.36);
    expect(points[1].projected).toBe(70.36);
  });

  it('does not label the boundary twice', () => {
    const points = splitMeasuredAndProjected(xAxis, makeSeries({ actualCount: 2 }));
    expect(points[1].projectedLabel).toBeNull();
    expect(points[2].projectedLabel).toBe(78);
  });

  it('marks points after the boundary as projected only', () => {
    const points = splitMeasuredAndProjected(xAxis, makeSeries({ actualCount: 2 }));
    expect(points[3]).toEqual({
      label: 'T3 (เป้าหมาย)',
      measured: null,
      projected: 85,
      projectedLabel: 85,
    });
  });

  it('treats every point as measured when the API omits actualCount', () => {
    const points = splitMeasuredAndProjected(xAxis, makeSeries());
    expect(points.every((point) => point.measured !== null)).toBe(true);
    expect(points.filter((point) => point.projectedLabel !== null)).toHaveLength(0);
  });

  it('keeps a missing value null on both series', () => {
    const points = splitMeasuredAndProjected(xAxis, makeSeries({ data: [57.3], actualCount: 2 }));
    expect(points[1].measured).toBeNull();
  });
});
