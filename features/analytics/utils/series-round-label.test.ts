import { describe, expect, it } from 'vitest';
import { formatSeriesRoundLabel } from './series-round-label';

describe('formatSeriesRoundLabel', () => {
  it('lists a pair of rounds side by side', () => {
    expect(formatSeriesRoundLabel(['T0', 'T1'])).toBe('T0 vs T1');
  });

  it('collapses three or more rounds into a range', () => {
    expect(formatSeriesRoundLabel(['T0', 'T1', 'T2', 'T3'])).toBe('T0 – T3');
  });

  it('keeps a single round on its own', () => {
    expect(formatSeriesRoundLabel(['T0'])).toBe('T0');
  });

  it('strips the qualifier the mock series names carry', () => {
    expect(formatSeriesRoundLabel(['T0 (เริ่มต้น)', 'T1 (หลังค่าย)'])).toBe('T0 vs T1');
  });

  it('returns an empty label when there are no series', () => {
    expect(formatSeriesRoundLabel([])).toBe('');
  });
});
