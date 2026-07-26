import type { RoundPair, Top20RoundFilter } from '../types/dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: () => ['dashboard', 'kpis'] as const,
  provinceDistribution: () => ['dashboard', 'province-distribution'] as const,
  top20: (round: Top20RoundFilter) => ['dashboard', 'top20', round] as const,
  incubationProgress: () => ['dashboard', 'incubation-progress'] as const,
  provinceComparison: (pair: RoundPair) =>
    ['dashboard', 'province-comparison', pair.from, pair.to] as const,
  storeRoundScores: () => ['dashboard', 'store-scores'] as const,
  activities: () => ['dashboard', 'activities'] as const,
  reportsStatus: () => ['dashboard', 'reports-status'] as const,
};
