import type { Severity } from '@/features/assessment';

export const SEVERITY_LABELS: Record<Severity, string> = {
  WARNING: 'เฝ้าระวัง',
  CRITICAL: 'รุนแรง',
};

export const SEVERITY_BADGE_CLASS: Record<Severity, string> = {
  WARNING: 'border-amber-200 bg-amber-50 text-amber-700',
  CRITICAL: 'border-score-red/20 bg-score-red/10 text-score-red',
};
