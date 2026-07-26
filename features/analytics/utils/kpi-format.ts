import type { AnalyticsKPIs } from '../types/analytics.types';

const SCORE_FRACTION_DIGITS = 2;

/** Trims the trailing zeros a fixed-decimal score picks up (72.34, 312, 7.5). */
export function formatScore(value: number): string {
  return Number(value.toFixed(SCORE_FRACTION_DIGITS)).toLocaleString('th-TH');
}

/** Signed delta between two rounds, e.g. "+23" / "-4". */
export function formatDelta(delta: number): string {
  return `${delta > 0 ? '+' : ''}${formatScore(delta)}`;
}

/** Signed percentage, e.g. "+7.96%". */
export function formatRate(rate: number): string {
  return `${rate > 0 ? '+' : ''}${rate.toFixed(SCORE_FRACTION_DIGITS)}%`;
}

/**
 * Point difference between the compared rounds, or null when either round has
 * no score yet — "0" would read as "no change" instead of "not measured".
 */
export function getScoreDelta(kpis: AnalyticsKPIs): number | null {
  if (kpis.t0Score === null || kpis.t1Score === null) return null;
  return kpis.t1Score - kpis.t0Score;
}

/**
 * Where the store sits as a percentage of the field. Null when the rank or the
 * field size is missing, so the caller shows "ยังไม่ประเมิน" rather than "Top 0%".
 */
export function getTopPercentile(kpis: AnalyticsKPIs): number | null {
  if (kpis.rankInProject === null || kpis.totalStores <= 0) return null;
  return (kpis.rankInProject / kpis.totalStores) * 100;
}
