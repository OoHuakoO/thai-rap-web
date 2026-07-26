import { ZONE_DESCRIPTIONS, type Zone } from '@/features/assessment';
import {
  ANALYTICS_KPI_ICONS,
  INCUBATION_READY_THRESHOLD,
  type ComparePairOption,
} from '../constants/analytics-display.constants';
import { ANALYTICS_KPI_TEXT } from '../constants/analytics-text.constants';
import type { AnalyticsKPIs } from '../types/analytics.types';
import {
  formatDelta,
  formatRate,
  formatScore,
  getScoreDelta,
  getTopPercentile,
} from '../utils/kpi-format';
import { AnalyticsKpiCard } from './analytics-kpi-card';

interface AnalyticsKpiRowProps {
  kpis: AnalyticsKPIs;
  comparePair: ComparePairOption;
}

const GRID_CLASS = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';

export function AnalyticsKpiRow({ kpis, comparePair }: AnalyticsKpiRowProps) {
  const { from, to } = comparePair;
  const delta = getScoreDelta(kpis);
  const topPercentile = getTopPercentile(kpis);
  const zone = kpis.zone as Zone | null;

  return (
    <div className={GRID_CLASS}>
      <AnalyticsKpiCard
        title={ANALYTICS_KPI_TEXT.baselineTitle(from)}
        value={kpis.t0Score === null ? '—' : formatScore(kpis.t0Score)}
        unit={kpis.t0Score === null ? undefined : ANALYTICS_KPI_TEXT.scoreUnit}
        caption={kpis.t0Score === null ? ANALYTICS_KPI_TEXT.noScore : ANALYTICS_KPI_TEXT.outOf}
        icon={ANALYTICS_KPI_ICONS.baseline}
        accent="purple"
      />

      <AnalyticsKpiCard
        title={ANALYTICS_KPI_TEXT.currentTitle(to)}
        value={kpis.t1Score === null ? '—' : formatScore(kpis.t1Score)}
        unit={kpis.t1Score === null ? undefined : ANALYTICS_KPI_TEXT.scoreUnit}
        caption={kpis.t1Score === null ? ANALYTICS_KPI_TEXT.noScore : ANALYTICS_KPI_TEXT.outOf}
        icon={ANALYTICS_KPI_ICONS.current}
        accent="orange"
      />

      <AnalyticsKpiCard
        title={ANALYTICS_KPI_TEXT.improvementTitle(from, to)}
        value={delta === null ? '—' : formatDelta(delta)}
        // Doc §8.4: a 0 baseline has no defined growth rate, so the API sends
        // null and the card reports the raw gain as "เริ่มจากศูนย์" instead.
        caption={
          kpis.improvementRate === null
            ? delta === null
              ? ANALYTICS_KPI_TEXT.noScore
              : ANALYTICS_KPI_TEXT.improvementFromZero
            : formatRate(kpis.improvementRate)
        }
        icon={ANALYTICS_KPI_ICONS.improvement}
        accent="green"
      />

      <AnalyticsKpiCard
        title={ANALYTICS_KPI_TEXT.rankTitle}
        value={kpis.rankInProject === null ? '—' : String(kpis.rankInProject)}
        unit={
          kpis.rankInProject === null ? undefined : ANALYTICS_KPI_TEXT.rankUnit(kpis.totalStores)
        }
        caption={
          topPercentile === null
            ? ANALYTICS_KPI_TEXT.noScore
            : ANALYTICS_KPI_TEXT.rankTopPercent(topPercentile)
        }
        icon={ANALYTICS_KPI_ICONS.rank}
        accent="purple"
      />

      <AnalyticsKpiCard
        title={ANALYTICS_KPI_TEXT.zoneTitle}
        value={zone ?? '—'}
        // Zone names are words, not figures — at the numeric scale they wrap
        // and push this card taller than the rest of the row.
        valueClassName="text-lg leading-snug"
        caption={zone ? ZONE_DESCRIPTIONS[zone] : ANALYTICS_KPI_TEXT.noScore}
        icon={ANALYTICS_KPI_ICONS.zone}
        accent="blue"
      />

      <AnalyticsKpiCard
        title={ANALYTICS_KPI_TEXT.readinessTitle}
        value={kpis.incubationReadiness === null ? '—' : formatScore(kpis.incubationReadiness)}
        unit={kpis.incubationReadiness === null ? undefined : ANALYTICS_KPI_TEXT.readinessOutOf}
        caption={
          kpis.incubationReadiness === null
            ? ANALYTICS_KPI_TEXT.noScore
            : kpis.incubationReadiness >= INCUBATION_READY_THRESHOLD
              ? ANALYTICS_KPI_TEXT.readinessReady
              : ANALYTICS_KPI_TEXT.readinessNotReady
        }
        icon={ANALYTICS_KPI_ICONS.readiness}
        accent="orange"
      />
    </div>
  );
}
