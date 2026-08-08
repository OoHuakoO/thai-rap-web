import { describe, expect, it } from 'vitest';
import type { PitchingRankingRow } from '../types/pitching.types';
import { buildScoreDistribution } from './pitching-distribution';

function row(avgScore: number): PitchingRankingRow {
  return {
    storeId: `store-${avgScore}`,
    storeCode: 'RAP69-001',
    storeName: 'ร้านทดสอบ',
    province: 'จันทบุรี',
    rank: 1,
    judgeCount: 3,
    avgScore,
    level: 'SUITABLE',
    recommendationCounts: {
      SELECTED: 0,
      WAITING_LIST: 0,
      MINIMUM_NOT_MET: 0,
      NOT_SELECTED: 0,
    },
    minimumPassedCount: 0,
  };
}

function countsByLabel(rows: PitchingRankingRow[]): Record<string, number> {
  return Object.fromEntries(buildScoreDistribution(rows).map((band) => [band.label, band.count]));
}

describe('buildScoreDistribution', () => {
  it('puts a score in the band it clears', () => {
    const counts = countsByLabel([row(95), row(83), row(74), row(65), row(41)]);

    expect(counts['90 - 100 คะแนน']).toBe(1);
    expect(counts['80 - 89 คะแนน']).toBe(1);
    expect(counts['70 - 79 คะแนน']).toBe(1);
    expect(counts['60 - 69 คะแนน']).toBe(1);
    expect(counts['ต่ำกว่า 60 คะแนน']).toBe(1);
  });

  it('keeps a two-decimal average just under a boundary in the lower band', () => {
    const counts = countsByLabel([row(89.97), row(90)]);

    expect(counts['80 - 89 คะแนน']).toBe(1);
    expect(counts['90 - 100 คะแนน']).toBe(1);
  });

  it('reports each band as a share of the cohort', () => {
    const bands = buildScoreDistribution([row(95), row(83), row(82), row(81)]);

    expect(bands.find((band) => band.label === '80 - 89 คะแนน')?.pct).toBe(75);
    expect(bands.find((band) => band.label === '90 - 100 คะแนน')?.pct).toBe(25);
  });

  it('returns every band at zero for an empty cohort', () => {
    const bands = buildScoreDistribution([]);

    expect(bands).toHaveLength(5);
    expect(bands.every((band) => band.count === 0 && band.pct === 0)).toBe(true);
  });
});
