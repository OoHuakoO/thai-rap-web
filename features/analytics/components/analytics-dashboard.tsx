'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton, Loading } from '@/components/shared/loading';
import { useDebounce } from '@/hooks/use-debounce';
import { useStores } from '@/features/store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  ALL_PROVINCES_VALUE,
  DEFAULT_COMPARE_PAIR,
  findComparePair,
} from '../constants/analytics-display.constants';
import { ANALYTICS_PAGE_TEXT, HIGHLIGHT_CARD_TEXT } from '../constants/analytics-text.constants';
import { useExportAnalytics } from '../hooks/use-export-analytics';
import { useStoreAnalytics } from '../hooks/use-store-analytics';
import type { AnalyticsQueryParams } from '../types/analytics.types';
import { ActionPlansSection } from './action-plans-section';
import { AiAnalysisCard } from './ai-analysis-card';
import { AnalyticsKpiRow } from './analytics-kpi-row';
import { AnalyticsToolbar } from './analytics-toolbar';
import { DimensionComparisonCard } from './dimension-comparison-card';
import { HighlightListCard } from './highlight-list-card';
import { IncubationStatusCard } from './incubation-status-card';
import { MentorRecommendationsCard } from './mentor-recommendations-card';
import { RadarComparisonCard } from './radar-comparison-card';
import { RedFlagsCard } from './red-flags-card';
import { TargetCard } from './target-card';
import { TrendCard } from './trend-card';

const STORE_PICKER_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 300;

export function AnalyticsDashboard() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [comparePairValue, setComparePairValue] = useState<string>(DEFAULT_COMPARE_PAIR.value);
  const [province, setProvince] = useState(ALL_PROVINCES_VALUE);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const comparePair = findComparePair(comparePairValue);

  const {
    data: storeList,
    isLoading: isStoresLoading,
    isError: isStoresError,
    error: storesError,
  } = useStores({
    limit: STORE_PICKER_LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(province !== ALL_PROVINCES_VALUE && { province }),
  });

  const stores = storeList?.items ?? [];

  // The page is store-scoped but the route is not, so the first store in the
  // list stands in until the user picks one. Re-runs when the province filter
  // empties the current selection out of the list.
  useEffect(() => {
    if (stores.length === 0) return;
    if (storeId && stores.some((store) => store.id === storeId)) return;
    setStoreId(stores[0].id);
  }, [stores, storeId]);

  const selectedStore = stores.find((store) => store.id === storeId);

  const params: AnalyticsQueryParams = {
    compare: comparePair.value,
    ...(province !== ALL_PROVINCES_VALUE && { province }),
  };

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    isFetching: isAnalyticsFetching,
    isError: isAnalyticsError,
    error: analyticsError,
    refetch,
  } = useStoreAnalytics(storeId ?? undefined, params);

  const { mutate: exportAnalytics, isPending: isExporting } = useExportAnalytics();

  const pageHeader = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-text-main">{ANALYTICS_PAGE_TEXT.title}</h1>
        <p className="text-xs text-charcoal">{ANALYTICS_PAGE_TEXT.subtitle}</p>
      </div>
      <AnalyticsToolbar
        stores={stores}
        selectedStore={selectedStore}
        onStoreChange={setStoreId}
        search={search}
        onSearchChange={setSearch}
        comparePair={comparePair}
        onComparePairChange={setComparePairValue}
        province={province}
        onProvinceChange={setProvince}
        lastUpdated={analytics?.lastUpdated}
        onRefresh={() => void refetch()}
        isRefreshing={isAnalyticsFetching}
        onExport={() => storeId && exportAnalytics({ storeId, params })}
        isExporting={isExporting}
        canExport={Boolean(storeId) && Boolean(analytics)}
      />
    </div>
  );

  if (isStoresLoading) {
    return <Loading className="py-16" />;
  }

  if (isStoresError) {
    return <AlertCard variant="error" message={extractErrorMessage(storesError)} />;
  }

  if (stores.length === 0) {
    return (
      <div className="space-y-4">
        {pageHeader}
        <AlertCard variant="info" message={ANALYTICS_PAGE_TEXT.noStores} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pageHeader}

      {isAnalyticsLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isAnalyticsLoading && isAnalyticsError && (
        <AlertCard variant="error" message={extractErrorMessage(analyticsError)} />
      )}

      {!isAnalyticsLoading && !isAnalyticsError && !analytics && (
        <AlertCard variant="info" message={ANALYTICS_PAGE_TEXT.noAnalysis} />
      )}

      {!isAnalyticsLoading && !isAnalyticsError && analytics && (
        <>
          <AnalyticsKpiRow kpis={analytics.kpis} comparePair={comparePair} />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <div className="space-y-3 xl:col-span-3">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <RadarComparisonCard radar={analytics.radar} />
                <DimensionComparisonCard radar={analytics.radar} comparePair={comparePair} />
                <TrendCard trend={analytics.trend} />
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <AiAnalysisCard aiAnalysis={analytics.aiAnalysis} aiInsight={analytics.aiInsight} />
                <MentorRecommendationsCard recommendations={analytics.mentorRecommendations} />
              </div>
            </div>

            <div className="space-y-3">
              <HighlightListCard
                title={HIGHLIGHT_CARD_TEXT.strengthsTitle}
                items={analytics.strengths}
                emptyMessage={HIGHLIGHT_CARD_TEXT.emptyStrengths}
                icon={Trophy}
                accent="green"
              />
              <HighlightListCard
                title={HIGHLIGHT_CARD_TEXT.weaknessesTitle}
                items={analytics.weaknesses}
                emptyMessage={HIGHLIGHT_CARD_TEXT.emptyWeaknesses}
                icon={AlertTriangle}
                accent="orange"
              />
              <RedFlagsCard redFlags={analytics.redFlags} />
              <IncubationStatusCard incubationStatus={analytics.incubationStatus} />
              {analytics.target && <TargetCard target={analytics.target} />}
            </div>
          </div>

          {storeId && <ActionPlansSection storeId={storeId} />}
        </>
      )}
    </div>
  );
}
