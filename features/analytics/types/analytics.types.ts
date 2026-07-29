import type { RedFlag, Round } from '@/features/assessment';
import type { Zone } from '@/features/assessment';

/**
 * Which two rounds the page compares. Sent to the API as the `compare` query
 * param (`GET /analytics/{storeId}?compare=T0vsT1`).
 */
export type ComparePair = `${Round}vs${Round}`;

export interface AnalyticsKPIs {
  /** Weighted total 0–100 for the baseline round of the selected pair. */
  t0Score: number | null;
  /** Weighted total 0–100 for the comparison round of the selected pair. */
  t1Score: number | null;
  /** Percentage change between the two, or null when the baseline is 0/absent. */
  improvementRate: number | null;
  rankInProject: number | null;
  totalStores: number;
  zone: Zone | null;
  incubationReadiness: number | null;
}

export interface RadarSeries {
  name: string;
  /** One value per axis, same order and length as `RadarChartData.axes`. */
  data: (number | null)[];
  color?: string;
  dashed?: boolean;
}

export interface RadarChartData {
  /** Dimension labels straight from the API — never hardcoded on the client. */
  axes: string[];
  series: RadarSeries[];
}

export interface TrendSeries {
  name: string;
  data: (number | null)[];
  color?: string;
  /**
   * How many leading points are measured rather than projected. The trend line
   * is drawn solid up to this point and dashed after it. Not part of the
   * OpenAPI contract yet — when absent every point is treated as measured.
   */
  actualCount?: number;
}

export interface TrendData {
  xAxis: string[];
  series: TrendSeries[];
}

export interface DimensionHighlight {
  dimensionId: number;
  name: string;
  score: number;
}

export interface IncubationStatus {
  status: string;
  step: string;
  /** Estimated chance of selection, 0–100. */
  chance: number;
}

/**
 * Final-round goal shown in the "เป้าหมาย" card. Not in the OpenAPI contract
 * yet — the card is skipped when the API omits it.
 */
export interface AnalyticsTarget {
  round: Round | string;
  totalScore: number;
  incubationReadiness: number;
  /** e.g. 10 → "โอกาสติด Top 10% ของโครงการ". */
  topPercentile: number;
}

export interface StoreAnalytics {
  storeId: string;
  kpis: AnalyticsKPIs;
  radar: RadarChartData;
  trend: TrendData;
  strengths: DimensionHighlight[];
  weaknesses: DimensionHighlight[];
  redFlags: RedFlag[];
  /** Narrative analysis; one bullet per line. */
  aiAnalysis: string | null;
  /** Emphasised closing line under the AI bullets. Not in the contract yet. */
  aiInsight?: string | null;
  mentorRecommendations: string[];
  incubationStatus: IncubationStatus | null;
  target?: AnalyticsTarget;
}

export type IDPPhase = 'D7' | 'D30' | 'D90';

export interface ActionPlan {
  phase: IDPPhase;
  label: string;
  /** 0–100. */
  progress: number;
  items: string[];
}

export interface AnalyticsQueryParams {
  compare: ComparePair;
  province?: string;
}

export interface DownloadedFile {
  blob: Blob;
  filename?: string;
}
