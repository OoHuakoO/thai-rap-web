import { PITCHING_SCORE_BANDS } from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';

export interface PitchingScoreBandCount {
  key: string;
  label: string;
  color: string;
  count: number;
  /** Share of the cohort, 0–100. Zero when the cohort is empty. */
  pct: number;
}

/**
 * การกระจายคะแนนรวม — how many ranked stores fall in each band.
 *
 * Bands are matched on `min` alone in the high-to-low order they are declared,
 * so a score belongs to the first band it clears. Upper bounds would have to be
 * exclusive to cover a 2-dp average like 89.97, and one wrong `<=` there drops
 * a store out of the donut without changing its total.
 */
export function buildScoreDistribution(rows: PitchingRankingRow[]): PitchingScoreBandCount[] {
  const bands = PITCHING_SCORE_BANDS.map((band) => ({ ...band, count: 0, pct: 0 }));

  for (const row of rows) {
    const band = bands.find((candidate) => row.avgScore >= candidate.min);
    if (band) band.count += 1;
  }

  return bands.map(({ key, label, color, count }) => ({
    key,
    label,
    color,
    count,
    pct: rows.length === 0 ? 0 : (count / rows.length) * 100,
  }));
}
