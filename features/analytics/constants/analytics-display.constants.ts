import { AlertTriangle, MapPin, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUNDS, type Round } from '@/features/assessment';
import { colors } from '@/styles/tokens';
import { ROLES, type Role } from '@/types/auth.types';
import type { ComparePair } from '../types/analytics.types';

// Who may see one store's charts inline on its detail page. Wider than
// `analytics:read`, which gates the programme-wide /analytics page and is
// withheld from ENTREPRENEUR on purpose — but the API's own allow-list
// (ASSESSMENT_READ_ROLES, read by AnalyticsService.assertCanRead) includes
// ENTREPRENEUR and then scopes the store to the ones it owns, so an owner
// reading its own analytics is a call the backend already answers.
//
// JUDGE and VIEWER reach the store page but are not on that allow-list; leaving
// them out keeps the section from firing a request the API 403s, which the
// axios interceptor would turn into a redirect to /403.
export const STORE_ANALYTICS_SECTION_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ASSESSOR,
  ROLES.MENTOR,
  ROLES.ENTREPRENEUR,
];

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

/**
 * One colour per round in funnel order — T0 purple, T1 orange (the pair the
 * design mock-up shows), then green and blue for T2/T3. The radar and the bar
 * chart plot every submitted round, so the list has to reach four; a store
 * part-way through the funnel just uses the leading entries.
 */
export const SERIES_COLORS = [
  colors.purpleBanner,
  colors.orange,
  colors.scoreGreen,
  colors.blue,
] as const;

/**
 * Above this many series the bar chart drops its per-bar value labels: four
 * rounds × eight dimensions is 32 numbers, which collide with each other at any
 * card width the page can give them. The tooltip still reports exact scores.
 */
export const MAX_SERIES_WITH_VALUE_LABELS = 2;

export const SCORE_AXIS_TICKS = [0, 25, 50, 75, 100];
export const SCORE_AXIS_DOMAIN: [number, number] = [0, 100];

/**
 * Two text sizes for the same three charts. `default` is the analytics page,
 * where the cards sit three-across next to a right rail. `lg` is the store
 * detail page, which gives them the full page width — at the page's own reading
 * size the 8–11px chart text the narrow layout needs looks like fine print.
 *
 * Recharts writes tick and label text as SVG attributes, not classes, so the
 * sizes have to travel as numbers rather than Tailwind utilities; the card
 * chrome around the plot (title, legends) uses the class fields.
 */
export type AnalyticsChartScale = 'default' | 'lg';

export interface AnalyticsChartScaleStyle {
  /** Card title. */
  cardTitle: string;
  /** Series legend beside/above the plot. */
  legend: string;
  /** Numbered dimension names listed under the bar chart. */
  dimensionLegend: string;
  chartHeight: number;
  /** X/Y axis ticks and the axis name. */
  axisTick: { fontSize: number; fill: string };
  /** Value printed on a bar or a trend point. */
  valueLabel: { fontSize: number; fontWeight: number; fill: string };
  /** Headroom above the plot — the axis name and the value labels sit in it. */
  chartTopMargin: number;
  /** How far the axis name is lifted clear of the topmost tick. */
  axisLabelOffset: number;
  /** Left gutter — the axis name starts at the plot's left edge and needs it. */
  chartLeftMargin: number;
  /** Wrapped Thai dimension name around the radar. */
  radarAxis: { fontSize: number; lineHeight: number; maxCharsPerLine: number; maxLines: number };
  /** 0–100 scale printed inside the radar. */
  radarRadiusFontSize: number;
  /** Radar plot radius — the labels need the rest of the box. */
  radarOuterRadius: string;
}

export const ANALYTICS_CHART_SCALE: Record<AnalyticsChartScale, AnalyticsChartScaleStyle> = {
  default: {
    cardTitle: 'text-sm',
    legend: 'text-[11px]',
    dimensionLegend: 'text-[10.5px]',
    chartHeight: 260,
    axisTick: { fontSize: 11, fill: colors.charcoal },
    valueLabel: { fontSize: 10, fontWeight: 600, fill: colors.charcoal },
    chartTopMargin: 20,
    axisLabelOffset: -12,
    // The axis name is anchored at the plot's left edge and drawn leftwards, so
    // with no gutter "คะแนน" started at -12px and lost its first glyph.
    chartLeftMargin: 14,
    radarAxis: { fontSize: 8, lineHeight: 9, maxCharsPerLine: 13, maxLines: 3 },
    radarRadiusFontSize: 9,
    // The card holds a third of the full page width now that the right rail
    // starts below these charts, so the plot can grow into room the labels no
    // longer need.
    radarOuterRadius: '66%',
  },
  lg: {
    cardTitle: 'text-base',
    legend: 'text-[13px]',
    dimensionLegend: 'text-[12.5px]',
    chartHeight: 380,
    axisTick: { fontSize: 14, fill: colors.charcoal },
    valueLabel: { fontSize: 13, fontWeight: 600, fill: colors.charcoal },
    chartTopMargin: 36,
    axisLabelOffset: -22,
    chartLeftMargin: 26,
    radarAxis: { fontSize: 11, lineHeight: 13, maxCharsPerLine: 13, maxLines: 3 },
    radarRadiusFontSize: 12,
    // Bounded by the label ring, not the box: at 11px the wrapped Thai names
    // reach the card edge before the plot does.
    radarOuterRadius: '50%',
  },
};

export const DEFAULT_CHART_SCALE: AnalyticsChartScale = 'default';

/**
 * The bar chart plots dimension numbers on the X axis and lists the full names
 * in a legend below, because eight Thai dimension names never fit as tick
 * labels. The number is the axis label's position in `radar.axes` + 1.
 */
export function toDimensionNumber(index: number): string {
  return String(index + 1);
}

// ─── Misc ────────────────────────────────────────────────────────────────────

/** Readiness at or above this is reported as ready for incubation. */
export const INCUBATION_READY_THRESHOLD = 60;

/** Rounds shown in the picker, in funnel order — re-exported so the toolbar
 *  doesn't need to know the assessment feature's internals. */
export const ANALYTICS_ROUNDS: readonly Round[] = ROUNDS;
