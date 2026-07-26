import { AlertTriangle, MapPin, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUNDS, type Round } from '@/features/assessment';
import { colors } from '@/styles/tokens';
import type { ComparePair, IDPPhase } from '../types/analytics.types';

export type AnalyticsAccent = 'purple' | 'orange' | 'green' | 'blue' | 'red';

export interface AnalyticsAccentClass {
  circle: string;
  text: string;
  /** Bullet/dot fill — written out rather than derived from `text`, because
   *  Tailwind only generates classes it can read as literals at build time. */
  dot: string;
  /** Tint behind a card header. */
  header: string;
}

/** Circle + text colours for the KPI cards and the right-rail card headers. */
export const ANALYTICS_ACCENT_CLASS: Record<AnalyticsAccent, AnalyticsAccentClass> = {
  purple: {
    circle: 'bg-purple-banner/10 text-purple-banner',
    text: 'text-purple-banner',
    dot: 'bg-purple-banner',
    header: 'bg-purple-banner/10',
  },
  orange: {
    circle: 'bg-orange/10 text-orange',
    text: 'text-orange',
    dot: 'bg-orange',
    header: 'bg-orange/10',
  },
  green: {
    circle: 'bg-score-green/10 text-score-green',
    text: 'text-score-green',
    dot: 'bg-score-green',
    header: 'bg-score-green/10',
  },
  blue: {
    circle: 'bg-blue-500/10 text-blue-600',
    text: 'text-blue-600',
    dot: 'bg-blue-600',
    header: 'bg-blue-500/10',
  },
  red: {
    circle: 'bg-score-red/10 text-score-red',
    text: 'text-score-red',
    dot: 'bg-score-red',
    header: 'bg-score-red/10',
  },
};

export const ANALYTICS_KPI_ICONS: Record<string, LucideIcon> = {
  baseline: Star,
  current: Star,
  improvement: TrendingUp,
  rank: Trophy,
  zone: MapPin,
  readiness: Target,
};

export const RED_FLAG_ICON: LucideIcon = AlertTriangle;

// ─── Compare pair options ────────────────────────────────────────────────────
// Every step of the funnel plus baseline-vs-latest. Unlike the dashboard's
// province comparison this is a single store, so a non-consecutive pair
// (T0 vs T3) is a meaningful "how far has this one shop come" question.

export interface ComparePairOption {
  value: ComparePair;
  from: Round;
  to: Round;
}

function pair(from: Round, to: Round): ComparePairOption {
  return { value: `${from}vs${to}`, from, to };
}

export const COMPARE_PAIR_OPTIONS: readonly ComparePairOption[] = [
  pair('T0', 'T1'),
  pair('T1', 'T2'),
  pair('T2', 'T3'),
  pair('T0', 'T3'),
];

export const DEFAULT_COMPARE_PAIR: ComparePairOption = COMPARE_PAIR_OPTIONS[0];

export function findComparePair(value: string): ComparePairOption {
  return COMPARE_PAIR_OPTIONS.find((option) => option.value === value) ?? DEFAULT_COMPARE_PAIR;
}

export function formatComparePairLabel(option: ComparePairOption): string {
  return `${option.from} vs ${option.to}`;
}

export const ALL_PROVINCES_VALUE = 'ALL';

// ─── Chart display ───────────────────────────────────────────────────────────

/** Baseline series is purple, comparison series orange — matches the design. */
export const SERIES_COLORS = [colors.purpleBanner, colors.orange] as const;

export const SCORE_AXIS_TICKS = [0, 25, 50, 75, 100];
export const SCORE_AXIS_DOMAIN: [number, number] = [0, 100];

export const RADAR_CHART_HEIGHT = 260;
export const BAR_CHART_HEIGHT = 260;
export const TREND_CHART_HEIGHT = 260;

export const AXIS_TICK = { fontSize: 11, fill: colors.charcoal };
export const BAR_VALUE_LABEL_STYLE = { fontSize: 10, fontWeight: 600, fill: colors.charcoal };

/**
 * The bar chart plots dimension numbers on the X axis and lists the full names
 * in a legend below, because eight Thai dimension names never fit as tick
 * labels. The number is the axis label's position in `radar.axes` + 1.
 */
export function toDimensionNumber(index: number): string {
  return String(index + 1);
}

// ─── Action plans ────────────────────────────────────────────────────────────

export const ACTION_PLAN_PHASE_DAYS: Record<IDPPhase, string> = {
  D7: '7',
  D30: '30',
  D90: '90',
};

export const ACTION_PLAN_PHASE_ORDER: readonly IDPPhase[] = ['D7', 'D30', 'D90'];

// ─── Misc ────────────────────────────────────────────────────────────────────

/** Readiness at or above this is reported as ready for incubation. */
export const INCUBATION_READY_THRESHOLD = 60;

/** Rounds shown in the picker, in funnel order — re-exported so the toolbar
 *  doesn't need to know the assessment feature's internals. */
export const ANALYTICS_ROUNDS: readonly Round[] = ROUNDS;
