'use client';

import { useEffect, useState } from 'react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { useDebounce } from '@/hooks/use-debounce';
import { useStores } from '@/features/store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  ALL_JUDGES,
  PITCHING_COHORT_LIMIT,
  PITCHING_DASHBOARD_TEXT,
  PITCHING_ROUND_DESCRIPTIONS,
  PITCHING_TEXT,
  PITCHING_TOP_RANKING_SIZE,
} from '../constants/pitching.constants';
import { usePitchingCohort } from '../hooks/use-pitching-cohort';
import { usePitchingStoreReport } from '../hooks/use-pitching-report';
import { PITCHING_ROUNDS, type PitchingRound } from '../types/pitching.types';
import { PitchingCriteriaChart } from './pitching-criteria-chart';
import { PitchingDashboardToolbar } from './pitching-dashboard-toolbar';
import { PitchingJudgeOpinion } from './pitching-judge-opinion';
import { PitchingJudgeTable } from './pitching-judge-table';
import { PitchingScoreBreakdown, type PitchingScoreRow } from './pitching-score-breakdown';
import { PitchingScoreDistribution } from './pitching-score-distribution';
import { PitchingStoreCard } from './pitching-store-card';
import { PitchingSummaryTiles } from './pitching-summary-tiles';
import { PitchingTopRanking } from './pitching-top-ranking';

const SEARCH_DEBOUNCE_MS = 400;

export function PitchingDashboard() {
  const [round, setRound] = useState<PitchingRound>(PITCHING_ROUNDS[0]);
  const [storeId, setStoreId] = useState('');
  const [judgeId, setJudgeId] = useState<string>(ALL_JUDGES);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const storesQuery = useStores({
    search: debouncedSearch || undefined,
    limit: PITCHING_COHORT_LIMIT,
  });
  const stores = storesQuery.data?.items ?? [];

  const cohortQuery = usePitchingCohort(round);
  const cohortRows = cohortQuery.data?.items ?? [];

  // Land on the highest-ranked store rather than the first alphabetically —
  // an unranked store opens the page onto four empty states.
  useEffect(() => {
    if (storeId) return;
    const fallback = cohortRows[0]?.storeId ?? stores[0]?.id;
    if (fallback) setStoreId(fallback);
  }, [storeId, cohortRows, stores]);

  const reportQuery = usePitchingStoreReport(storeId, round);
  const report = reportQuery.data ?? null;

  const judges = report?.judges ?? [];
  // A judge picked for one store is not on the panel of the next, so the
  // selection is validated against the current report instead of being reset by
  // an effect on every change of store or round.
  const activeJudge = judges.find((judge) => judge.judgeId === judgeId) ?? null;
  const store = stores.find((item) => item.id === storeId) ?? null;

  const scoreRows: PitchingScoreRow[] = activeJudge
    ? activeJudge.criteria.map((criterion) => ({
        id: criterion.id,
        code: criterion.code,
        title: criterion.title,
        maxScore: criterion.maxScore,
        score: criterion.score,
      }))
    : (report?.criteria ?? []).map((criterion) => ({
        id: criterion.id,
        code: criterion.code,
        title: criterion.title,
        maxScore: criterion.maxScore,
        score: criterion.avgScore,
      }));

  return (
    <>
      <PitchingDashboardToolbar
        round={round}
        onRoundChange={setRound}
        stores={stores}
        storeId={storeId}
        onStoreChange={setStoreId}
        judges={judges.map((judge) => ({ id: judge.judgeId, name: judge.judgeName }))}
        judgeId={activeJudge ? judgeId : ALL_JUDGES}
        onJudgeChange={setJudgeId}
        search={search}
        onSearchChange={setSearch}
      />

      <p className="text-sm text-charcoal">{PITCHING_ROUND_DESCRIPTIONS[round]}</p>

      {storesQuery.isError && (
        <AlertCard variant="error" message={extractErrorMessage(storesQuery.error)} />
      )}
      {!storesQuery.isLoading && !storesQuery.isError && stores.length === 0 && (
        <AlertCard
          variant="info"
          message={debouncedSearch ? PITCHING_DASHBOARD_TEXT.noStoreMatch : PITCHING_TEXT.noStore}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {store ? (
            <PitchingStoreCard store={store} level={report?.level ?? null} />
          ) : (
            <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.noStoreSelected} />
          )}
          {reportQuery.isLoading ? (
            <CardSkeleton />
          ) : (
            <PitchingScoreBreakdown
              rows={scoreRows}
              total={
                activeJudge
                  ? (activeJudge.totalScore ?? activeJudge.currentScore)
                  : (report?.avgScore ?? null)
              }
              scoreColumnLabel={
                activeJudge
                  ? PITCHING_DASHBOARD_TEXT.criteriaJudgeColumn
                  : PITCHING_DASHBOARD_TEXT.criteriaAverageColumn
              }
            />
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          {reportQuery.isError && (
            <AlertCard variant="error" message={extractErrorMessage(reportQuery.error)} />
          )}
          {reportQuery.isLoading && <CardSkeleton />}
          {report && <PitchingSummaryTiles report={report} />}
          {(activeJudge ?? judges[0]) && (
            <PitchingJudgeOpinion pitching={activeJudge ?? judges[0]} />
          )}
        </div>

        <div className="lg:col-span-3">
          <PitchingTopRanking
            rows={cohortRows}
            size={PITCHING_TOP_RANKING_SIZE}
            selectedStoreId={storeId}
            onSelectStore={setStoreId}
            isLoading={cohortQuery.isLoading}
            error={cohortQuery.isError ? cohortQuery.error : null}
          />
        </div>
      </div>

      {/* The design puts these three side by side. The judge table needs ~580px
          for its six columns and a third of the shell is ~450px, so the wide
          card takes the row and the cohort donut drops below rather than the
          table growing a permanent horizontal scrollbar. */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PitchingJudgeTable judges={judges} />
        </div>
        <div className="lg:col-span-5">
          <PitchingCriteriaChart criteria={report?.criteria ?? []} />
        </div>
      </div>

      <PitchingScoreDistribution rows={cohortRows} />
    </>
  );
}
