export type AssessmentRound = 'T0' | 'T1' | 'T2' | 'T3';
export type Top20RoundFilter = 'all' | AssessmentRound;
export type ActivityType = 'warning' | 'event' | 'announcement';
export type ReportFormat = 'PDF' | 'XLSX' | 'CSV';
export type ReportStatus = 'PENDING' | 'GENERATING' | 'DONE' | 'FAILED';
export type IncubationStepStatus = 'completed' | 'active' | 'pending';

export interface DashboardKPIs {
  totalStores: number;
  targetStores: number;
  t0Completed: number;
  t0Percentage?: number;
  t1Completed: number;
  t1Percentage?: number;
  t2Completed: number;
  t2Percentage?: number;
  t3Completed: number;
  t3Percentage?: number;
  selectedStores: number;
  selectedPercentage?: number;
  improvedStores: number;
  improvementRate: number;
  avgScore: number;
  lastUpdated?: string;
}

export interface ProvinceDistributionItem {
  province: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface Top20Entry {
  rank: number;
  storeId: string;
  storeName: string;
  province: string;
  storeType: string;
  t1Score: number;
}

export interface IncubationStep {
  label: string;
  count: number;
  percentage: number;
}

export interface ProvinceComparison {
  province: string;
  fromRound: AssessmentRound;
  toRound: AssessmentRound;
  fromScore: number;
  toScore: number;
}

export interface StoreRoundScores {
  storeId: string;
  storeName: string;
  province: string;
  storeType: string;
  scores: Record<AssessmentRound, number | null>;
}

export interface DownloadedFile {
  blob: Blob;
  filename?: string;
}

export interface RoundPair {
  from: AssessmentRound;
  to: AssessmentRound;
}

export interface ActivityItem {
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  urgent: boolean;
}

export interface ReportStatusItem {
  id: string;
  name: string;
  format: ReportFormat;
  createdAt: string;
  status: ReportStatus;
  downloadUrl?: string;
}
