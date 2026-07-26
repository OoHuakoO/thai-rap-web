'use client';

import { useEffect, useState } from 'react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import { useStores } from '@/features/store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { OVERVIEW_TAB, REPORT_ROUNDS, REPORT_TEXT } from '../constants/report.constants';
import { OverviewReportPanel } from './overview-report-panel';
import { RoundReportPanel } from './round-report-panel';

// The store list is already scoped server-side: an ENTREPRENEUR gets only the
// store they own, so this picker doubles as their "my store" selector.
const STORE_PAGE_SIZE = 100;

export function ReportWorkspace() {
  const { data, isLoading, isError, error } = useStores({ limit: STORE_PAGE_SIZE });
  const stores = data?.items ?? [];

  const [storeId, setStoreId] = useState('');
  const [tab, setTab] = useState<string>(OVERVIEW_TAB);

  useEffect(() => {
    if (!storeId && stores.length > 0) setStoreId(stores[0].id);
  }, [storeId, stores]);

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (stores.length === 0) return <AlertCard variant="info" message={REPORT_TEXT.noStore} />;

  return (
    <div className="space-y-4">
      <div className="max-w-md space-y-1.5">
        <label className="text-sm font-medium text-text-main" htmlFor="report-store">
          {REPORT_TEXT.storeLabel}
        </label>
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger id="report-store" aria-label={REPORT_TEXT.storeLabel}>
            <SelectValue placeholder={REPORT_TEXT.storePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!storeId ? (
        <AlertCard variant="info" message={REPORT_TEXT.selectStoreFirst} />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value={OVERVIEW_TAB}>{REPORT_TEXT.overviewTab}</TabsTrigger>
            {REPORT_ROUNDS.map((round) => (
              <TabsTrigger key={round} value={round}>
                {round}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={OVERVIEW_TAB} className="mt-4">
            <OverviewReportPanel storeId={storeId} />
          </TabsContent>
          {REPORT_ROUNDS.map((round) => (
            <TabsContent key={round} value={round} className="mt-4">
              <RoundReportPanel storeId={storeId} round={round as AssessmentRound} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
