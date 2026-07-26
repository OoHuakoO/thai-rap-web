'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { KPI_CARD_CONFIGS } from '../constants/dashboard-display.constants';
import { DASHBOARD_KPI_TEXT } from '../constants/dashboard-text.constants';
import { useDashboardKpis } from '../hooks/use-dashboard-kpis';
import { DashboardKpiCard } from './dashboard-kpi-card';

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';

export function KpiRow() {
  const { data: kpis, isLoading, isError, error } = useDashboardKpis();

  if (isLoading) {
    return (
      <div className={GRID_CLASS}>
        {KPI_CARD_CONFIGS.map((config) => (
          <CardSkeleton key={config.id} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  }

  if (!kpis) {
    return <AlertCard variant="info" message={DASHBOARD_KPI_TEXT.empty} />;
  }

  return (
    <div className={GRID_CLASS}>
      {KPI_CARD_CONFIGS.map((config) => (
        <DashboardKpiCard
          key={config.id}
          title={config.title}
          value={config.getValue(kpis)}
          percentage={config.getPercentage(kpis)}
          subtitle={config.getSubtitle?.(kpis)}
          icon={config.icon}
          accent={config.accent}
        />
      ))}
    </div>
  );
}
