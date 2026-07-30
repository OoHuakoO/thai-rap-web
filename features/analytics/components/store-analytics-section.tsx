'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  DEFAULT_COMPARE_PAIR,
  STORE_ANALYTICS_SECTION_ROLES,
  type AnalyticsChartScale,
} from '../constants/analytics-display.constants';
import { STORE_ANALYTICS_SECTION_TEXT } from '../constants/analytics-text.constants';
import { useStoreAnalytics } from '../hooks/use-store-analytics';
import { DimensionComparisonCard } from './dimension-comparison-card';
import { RadarComparisonCard } from './radar-comparison-card';
import { TrendCard } from './trend-card';

interface StoreAnalyticsSectionProps {
  storeId: string;
}

const SKELETON_COUNT = 3;

/** Full page width here, so the charts are read at the page's own text size. */
const SECTION_CHART_SCALE: AnalyticsChartScale = 'lg';

/**
 * The three analytics charts inline on a store's detail page. All three plot
 * every round the store has; the compare pair is fixed to the default only
 * because the API requires the param for its KPIs, which this section doesn't
 * render — picking a pair belongs on the analytics page, which the header link
 * points to for the roles that can open it.
 */
export function StoreAnalyticsSection({ storeId }: StoreAnalyticsSectionProps) {
  const hasRole = useAuthStore((state) => state.hasRole);
  const can = useAuthStore((state) => state.can);
  const canReadAnalytics = hasRole(STORE_ANALYTICS_SECTION_ROLES);
  // ENTREPRENEUR sees the charts but has no analytics:read, so the dashboard
  // guard would bounce it straight back off /analytics — no link for it.
  const canOpenAnalyticsPage = can(PERMISSIONS.ANALYTICS_READ);

  // Passing undefined keeps the query disabled, so a role outside the list
  // never fires the request the hook can't be skipped for.
  const {
    data: analytics,
    isLoading,
    isError,
    error,
  } = useStoreAnalytics(canReadAnalytics ? storeId : undefined, {
    compare: DEFAULT_COMPARE_PAIR.value,
  });

  if (!canReadAnalytics) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-lg">{STORE_ANALYTICS_SECTION_TEXT.title}</CardTitle>
        {canOpenAnalyticsPage && (
          <Link
            href={ROUTES.ANALYTICS}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-orange transition-colors hover:text-orange-light"
          >
            {STORE_ANALYTICS_SECTION_TEXT.viewAll}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && !analytics && (
          <AlertCard variant="info" message={STORE_ANALYTICS_SECTION_TEXT.empty} />
        )}

        {!isLoading && !isError && analytics && (
          // Same split as the analytics page: the two dimension charts share a
          // row with two thirds going to the bars, and the trend moves under
          // them rather than squeezing three charts across.
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <RadarComparisonCard radar={analytics.radar} scale={SECTION_CHART_SCALE} />
              <div className="lg:col-span-2">
                <DimensionComparisonCard radar={analytics.radar} scale={SECTION_CHART_SCALE} />
              </div>
            </div>
            <TrendCard trend={analytics.trend} scale={SECTION_CHART_SCALE} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
