'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
import type { AssessmentRound } from '@/features/dashboard';
import { PITCHING_ROUNDS, PITCHING_ROUND_LABELS, PitchingReportPanel } from '@/features/pitching';
import { useStores } from '@/features/store';
import { useAuthStore } from '@/stores/auth-store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  MATRIX_SCOPE_TAB,
  OVERVIEW_TAB,
  PITCHING_SCOPE_TAB,
  REPORT_ASSESSMENT_ROLES,
  REPORT_DETAIL_ROLES,
  REPORT_PITCHING_ROLES,
  REPORT_ROUNDS,
  REPORT_TEXT,
  STORE_SCOPE_TAB,
} from '../constants/report.constants';
import { OverviewReportPanel } from './overview-report-panel';
import { RoundMatrixPanel } from './round-matrix-panel';
import { RoundReportPanel } from './round-report-panel';

// The store list is already scoped server-side: an ENTREPRENEUR gets only the
// store they own, so this picker doubles as their "my store" selector.
const STORE_PAGE_SIZE = 100;

interface Scope {
  value: string;
  label: string;
  panel: ReactNode;
}

// Three scopes, each gated on its own role list, because they read three
// different APIs: a JUDGE holds reports:read for the pitching scope alone and
// would get nothing but 403s from the other two, while an ASSESSOR is the
// mirror image.
export function ReportWorkspace() {
  const hasRole = useAuthStore((state) => state.hasRole);

  const candidates: (Scope | false)[] = [
    hasRole(REPORT_ASSESSMENT_ROLES) && {
      value: STORE_SCOPE_TAB,
      label: REPORT_TEXT.storeScopeTab,
      panel: <StoreReportWorkspace />,
    },
    hasRole(REPORT_DETAIL_ROLES) && {
      value: MATRIX_SCOPE_TAB,
      label: REPORT_TEXT.matrixScopeTab,
      panel: <MatrixReportWorkspace />,
    },
    hasRole(REPORT_PITCHING_ROLES) && {
      value: PITCHING_SCOPE_TAB,
      label: REPORT_TEXT.pitchingScopeTab,
      panel: <PitchingReportWorkspace />,
    },
  ];

  return <ScopeTabs scopes={candidates.filter((scope): scope is Scope => scope !== false)} />;
}

// A single available scope renders bare — a one-tab strip over the page is
// chrome that decides nothing.
function ScopeTabs({ scopes }: { scopes: Scope[] }) {
  const [scope, setScope] = useState<string>(scopes[0]?.value ?? '');

  if (scopes.length === 0) return <AlertCard variant="info" message={REPORT_TEXT.noScope} />;
  if (scopes.length === 1) return <>{scopes[0].panel}</>;

  return (
    <Tabs value={scope} onValueChange={setScope} className="space-y-4">
      <TabsList>
        {scopes.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {scopes.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// The pitching page's own report panel, one round at a time — the same
// component /pitching renders, so the two can never drift.
function PitchingReportWorkspace() {
  const [round, setRound] = useState<string>(PITCHING_ROUNDS[0]);

  return (
    <Tabs value={round} onValueChange={setRound}>
      <TabsList aria-label={REPORT_TEXT.pitchingScopeTab}>
        {PITCHING_ROUNDS.map((item) => (
          <TabsTrigger key={item} value={item}>
            {PITCHING_ROUND_LABELS[item]}
          </TabsTrigger>
        ))}
      </TabsList>

      {PITCHING_ROUNDS.map((item) => (
        <TabsContent key={item} value={item} className="mt-4">
          <PitchingReportPanel round={item} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Every store's dimension scores for one round — the round picker is the only
// input, since the table already spans the whole cohort.
function MatrixReportWorkspace() {
  const [round, setRound] = useState<string>(REPORT_ROUNDS[0]);

  return (
    <Tabs value={round} onValueChange={setRound}>
      <TabsList aria-label={REPORT_TEXT.roundLabel}>
        {REPORT_ROUNDS.map((item) => (
          <TabsTrigger key={item} value={item}>
            {item}
          </TabsTrigger>
        ))}
      </TabsList>

      {REPORT_ROUNDS.map((item) => (
        <TabsContent key={item} value={item} className="mt-4">
          <RoundMatrixPanel round={item as AssessmentRound} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StoreReportWorkspace() {
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
