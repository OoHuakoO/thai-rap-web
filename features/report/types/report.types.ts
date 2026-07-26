import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';

export type ReportFileFormat = 'xlsx' | 'pdf';

export interface ReportStore {
  id: string;
  name: string;
  province: string;
  storeType: string;
  ownerName: string;
}

export interface ReportDimensionScore {
  dimensionId: number;
  dimensionName: string;
  weight: number;
  scorePct: number;
}

export interface ReportRedFlag {
  type: string;
  severity: 'WARNING' | 'CRITICAL';
  triggerQuestions: number[];
  resolved: boolean;
}

export interface RoundReport {
  store: ReportStore;
  round: AssessmentRound;
  totalScore: number | null;
  zone: string | null;
  assessorName: string;
  submittedAt: string | null;
  notes: string | null;
  dimensions: ReportDimensionScore[];
  redFlags: ReportRedFlag[];
}

export interface OverviewRoundSummary {
  round: AssessmentRound;
  totalScore: number | null;
  zone: string | null;
  delta: number | null;
  submittedAt: string | null;
}

export interface OverviewDimensionTrend {
  dimensionId: number;
  dimensionName: string;
  weight: number;
  scoresByRound: Partial<Record<AssessmentRound, number>>;
}

export interface OverviewReport {
  store: ReportStore;
  rounds: OverviewRoundSummary[];
  dimensionTrends: OverviewDimensionTrend[];
  unresolvedRedFlagCount: number;
}
