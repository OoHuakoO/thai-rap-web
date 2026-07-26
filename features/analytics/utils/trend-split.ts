import type { TrendSeries } from '../types/analytics.types';

export interface TrendPoint {
  label: string;
  /** Score for rounds the store has actually sat — drawn as a solid line. */
  measured: number | null;
  /** Projected score for future rounds — drawn dashed. */
  projected: number | null;
  /**
   * `projected` minus the boundary point. The boundary is duplicated across
   * both series so the solid and dashed lines meet, but its value label must
   * only be drawn once.
   */
  projectedLabel: number | null;
}

/**
 * Splits one API series into a measured and a projected series so the chart can
 * draw the first part solid and the rest dashed. The boundary point belongs to
 * both, otherwise the two lines render with a visible gap between them.
 *
 * `actualCount` is not in the OpenAPI contract yet; when the API omits it every
 * point is treated as measured rather than guessed at from the axis labels.
 */
export function splitMeasuredAndProjected(xAxis: string[], series: TrendSeries): TrendPoint[] {
  const actualCount = series.actualCount ?? xAxis.length;

  return xAxis.map((label, index) => {
    const value = series.data[index] ?? null;
    const isMeasured = index < actualCount;
    const isBoundary = index === actualCount - 1;

    return {
      label,
      measured: isMeasured ? value : null,
      projected: !isMeasured || isBoundary ? value : null,
      projectedLabel: isMeasured ? null : value,
    };
  });
}
