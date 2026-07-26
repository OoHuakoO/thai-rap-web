import { AlertTriangle, Calendar, FileSpreadsheet, FileText, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { colors } from '@/styles/tokens';
import type {
  ActivityType,
  AssessmentRound,
  DashboardKPIs,
  ReportFormat,
  ReportStatus,
  RoundPair,
  Top20RoundFilter,
} from '../types/dashboard.types';
import { DASHBOARD_KPI_TEXT } from './dashboard-text.constants';

export type KpiAccent = 'orange' | 'purple';

// Brand line-art for the KPI circles, shared with the store stats bar. These are
// alpha masks rendered through MaskIcon, so they take their colour from the
// circle — not baked-in white.
export const DASHBOARD_KPI_ICONS = {
  totalStores: '/icons/stats/participation.png',
  t0Completed: '/icons/stats/t0.png',
  t1Completed: '/icons/stats/t1.png',
  t2Completed: '/icons/stats/t2.png',
  t3Completed: '/icons/stats/t3.png',
  improvedStores: '/icons/stats/improvement.png',
} as const;

export interface KpiCardConfig {
  id: string;
  title: string;
  /** Path under `public/` to the MaskIcon artwork. */
  icon: string;
  accent: KpiAccent;
  getValue: (kpis: DashboardKPIs) => number;
  getPercentage: (kpis: DashboardKPIs) => number;
  getSubtitle?: (kpis: DashboardKPIs) => string;
}

function toPercentage(value: number | undefined, part: number, total: number): number {
  if (value !== undefined) return value;
  return total > 0 ? (part / total) * 100 : 0;
}

export const KPI_CARD_CONFIGS: readonly KpiCardConfig[] = [
  {
    id: 'totalStores',
    title: DASHBOARD_KPI_TEXT.totalStoresTitle,
    icon: DASHBOARD_KPI_ICONS.totalStores,
    accent: 'orange',
    getValue: (kpis) => kpis.totalStores,
    getPercentage: (kpis) => toPercentage(undefined, kpis.totalStores, kpis.targetStores),
    getSubtitle: (kpis) => DASHBOARD_KPI_TEXT.targetStores(kpis.targetStores),
  },
  {
    id: 't0Completed',
    title: DASHBOARD_KPI_TEXT.t0Title,
    icon: DASHBOARD_KPI_ICONS.t0Completed,
    accent: 'orange',
    getValue: (kpis) => kpis.t0Completed,
    getPercentage: (kpis) => toPercentage(kpis.t0Percentage, kpis.t0Completed, kpis.totalStores),
  },
  {
    id: 't1Completed',
    title: DASHBOARD_KPI_TEXT.t1Title,
    icon: DASHBOARD_KPI_ICONS.t1Completed,
    accent: 'orange',
    getValue: (kpis) => kpis.t1Completed,
    getPercentage: (kpis) => toPercentage(kpis.t1Percentage, kpis.t1Completed, kpis.totalStores),
  },
  {
    id: 't2Completed',
    title: DASHBOARD_KPI_TEXT.t2Title,
    icon: DASHBOARD_KPI_ICONS.t2Completed,
    accent: 'orange',
    getValue: (kpis) => kpis.t2Completed,
    getPercentage: (kpis) => toPercentage(kpis.t2Percentage, kpis.t2Completed, kpis.totalStores),
  },
  {
    id: 't3Completed',
    title: DASHBOARD_KPI_TEXT.t3Title,
    icon: DASHBOARD_KPI_ICONS.t3Completed,
    accent: 'orange',
    getValue: (kpis) => kpis.t3Completed,
    getPercentage: (kpis) => toPercentage(kpis.t3Percentage, kpis.t3Completed, kpis.totalStores),
  },
  {
    id: 'improvedStores',
    title: DASHBOARD_KPI_TEXT.improvementTitle,
    icon: DASHBOARD_KPI_ICONS.improvedStores,
    accent: 'purple',
    getValue: (kpis) => kpis.improvedStores,
    getPercentage: (kpis) => kpis.improvementRate,
  },
];

export const KPI_ACCENT_CLASS: Record<KpiAccent, { circle: string; bar: string }> = {
  orange: { circle: 'bg-orange text-white', bar: 'bg-orange' },
  purple: { circle: 'bg-purple-banner text-white', bar: 'bg-purple-banner' },
};

export interface ActivityDisplayConfig {
  icon: LucideIcon;
  iconBoxClass: string;
  rowClass: string;
  urgentBorderClass: string;
}

export const ACTIVITY_DISPLAY: Record<ActivityType, ActivityDisplayConfig> = {
  warning: {
    icon: AlertTriangle,
    iconBoxClass: 'bg-orange/10 text-orange',
    rowClass: 'bg-cream/60',
    urgentBorderClass: 'border-l-4 border-l-orange',
  },
  event: {
    icon: Calendar,
    iconBoxClass: 'bg-purple-banner/10 text-purple-banner',
    rowClass: 'bg-purple-banner/5',
    urgentBorderClass: 'border-l-4 border-l-purple-banner',
  },
  announcement: {
    icon: Megaphone,
    iconBoxClass: 'bg-orange/10 text-orange',
    rowClass: 'bg-cream/60',
    urgentBorderClass: 'border-l-4 border-l-orange',
  },
};

export interface RoundOption {
  value: Top20RoundFilter;
  label: string;
}

export const TOP20_ROUND_OPTIONS: readonly RoundOption[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'T0', label: 'T0' },
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
];

export const DEFAULT_TOP20_ROUND: Top20RoundFilter = 'all';

export const REPORT_FORMAT_DISPLAY: Record<
  ReportFormat,
  { label: string; icon: LucideIcon; iconClass: string }
> = {
  PDF: { label: 'PDF', icon: FileText, iconClass: 'text-score-red' },
  XLSX: { label: 'Excel', icon: FileSpreadsheet, iconClass: 'text-score-green' },
  CSV: { label: 'CSV', icon: FileSpreadsheet, iconClass: 'text-charcoal' },
};

export const REPORT_STATUS_DISPLAY: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: 'รอดำเนินการ', className: 'border-charcoal/20 bg-charcoal/10 text-charcoal' },
  GENERATING: { label: 'กำลังสร้าง', className: 'border-orange/20 bg-orange/10 text-orange' },
  DONE: { label: 'สำเร็จ', className: 'border-score-green/20 bg-score-green/10 text-score-green' },
  FAILED: { label: 'ล้มเหลว', className: 'border-score-red/20 bg-score-red/10 text-score-red' },
};

// Donut slices follow the design's orange → purple ramp; only palette tokens
// are used so a brand colour change flows through automatically.
export const PROVINCE_DONUT_COLORS: readonly string[] = [
  colors.orange,
  colors.orangeDark,
  colors.purpleBanner,
  colors.orangeLight,
  colors.cream,
];

export const COMPARISON_SERIES_COLORS = {
  fromScore: colors.orange,
  toScore: colors.purpleBanner,
} as const;

export interface RoundPairOption {
  value: string;
  pair: RoundPair;
}

// Consecutive rounds only — comparing T0 against T3 mixes stores that skipped
// rounds in between, which is not the delta the funnel is measuring.
export const COMPARISON_ROUND_PAIRS: readonly RoundPairOption[] = [
  { value: 'T0-T1', pair: { from: 'T0', to: 'T1' } },
  { value: 'T1-T2', pair: { from: 'T1', to: 'T2' } },
  { value: 'T2-T3', pair: { from: 'T2', to: 'T3' } },
];

export const DEFAULT_COMPARISON_PAIR = COMPARISON_ROUND_PAIRS[0];

export function formatRoundPairLabel(pair: RoundPair): string {
  return `${pair.from} vs ${pair.to}`;
}

export const ASSESSMENT_ROUND_COLUMNS: readonly AssessmentRound[] = ['T0', 'T1', 'T2', 'T3'];

export const COMPARISON_Y_AXIS_TICKS = [0, 25, 50, 75, 100];

// Design draws a fixed 5-step funnel: four orange stages then a purple
// "ผ่านเข้ารอบ" stage. Step labels/counts come from the API; only the icon and
// round badge per position are fixed here.
export const INCUBATION_STEP_ICONS: readonly string[] = [
  DASHBOARD_KPI_ICONS.t0Completed,
  DASHBOARD_KPI_ICONS.t1Completed,
  DASHBOARD_KPI_ICONS.t2Completed,
  DASHBOARD_KPI_ICONS.t3Completed,
  DASHBOARD_KPI_ICONS.improvedStores,
];

export const INCUBATION_STEP_BADGES = ['T0', 'T1', 'T2', 'T3', '4'] as const;

export const INCUBATION_LAST_STEP_ACCENT: KpiAccent = 'purple';
