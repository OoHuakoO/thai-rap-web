'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { useStore } from '@/features/store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  ALL_JUDGES,
  PITCHING_DASHBOARD_TEXT,
  PITCHING_ROUND_DESCRIPTIONS,
  PITCHING_TEXT,
  PITCHING_TOP_RANKING_SIZE,
} from '../constants/pitching.constants';
import { usePitchingCohort } from '../hooks/use-pitching-cohort';
import { usePitchingStoreReport, usePrefetchTopStoreReports } from '../hooks/use-pitching-report';
import { PITCHING_ROUNDS, type PitchingRound } from '../types/pitching.types';
import { pickOpinionJudge } from '../utils/pitching-opinion';
import { PitchingCriteriaChart } from './pitching-criteria-chart';
import { PitchingDashboardToolbar } from './pitching-dashboard-toolbar';
import { PitchingJudgeOpinion } from './pitching-judge-opinion';
import { PitchingJudgeTable } from './pitching-judge-table';
import { PitchingScoreBreakdown, type PitchingScoreRow } from './pitching-score-breakdown';
import { PitchingScoreDistribution } from './pitching-score-distribution';
import { PitchingStoreCard } from './pitching-store-card';
import { PitchingSummaryTiles } from './pitching-summary-tiles';
import { PitchingTopRanking } from './pitching-top-ranking';

export function PitchingDashboard() {
  const [round, setRound] = useState<PitchingRound>(PITCHING_ROUNDS[0]);
  const [storeId, setStoreId] = useState('');
  const [judgeId, setJudgeId] = useState<string>(ALL_JUDGES);

  const cohortQuery = usePitchingCohort(round);
  const cohortRows = cohortQuery.data?.items ?? [];

  // The ranking is also the store picker: it already carries every store this
  // page can report on, so the dashboard reads one store record — the selected
  // one — instead of a page of full store rows it renders one of.
  const storeQuery = useStore(storeId);
  const store = storeQuery.data ?? null;

  // Land on the highest-ranked store — an unranked store opens the page onto
  // four empty states.
  useEffect(() => {
    if (storeId) return;
    const fallback = cohortRows[0]?.storeId;
    if (fallback) setStoreId(fallback);
  }, [storeId, cohortRows]);

  usePrefetchTopStoreReports(cohortRows, round);

  const reportQuery = usePitchingStoreReport(storeId, round);
  const report = reportQuery.data ?? null;

  const judges = report?.judges ?? [];
  // Still validated against the current report on top of the resets below: the
  // report for a newly picked store arrives after the store changes, so between
  // the two the previous panel's judge would otherwise still be selected.
  const activeJudge = judges.find((judge) => judge.judgeId === judgeId) ?? null;
  // Comments can't be averaged, so "ทุกกรรมการ" shows one judge's — the first
  // who actually wrote something.
  const opinionJudge = activeJudge ?? pickOpinionJudge(judges);

  // A round change invalidates both narrower picks — its cohort is a different
  // set of stores, and each store has its own judge panel. Clearing the store
  // lets the effect above land on the new round's top-ranked store.
  const handleRoundChange = (next: PitchingRound) => {
    setRound(next);
    setStoreId('');
    setJudgeId(ALL_JUDGES);
  };

  const handleStoreChange = (next: string) => {
    setStoreId(next);
    setJudgeId(ALL_JUDGES);
  };

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
        onRoundChange={handleRoundChange}
        stores={cohortRows.map((row) => ({ id: row.storeId, name: row.storeName }))}
        storeId={storeId}
        onStoreChange={handleStoreChange}
        judges={judges.map((judge) => ({ id: judge.judgeId, name: judge.judgeName }))}
        judgeId={activeJudge ? judgeId : ALL_JUDGES}
        onJudgeChange={setJudgeId}
      />

      <div className="flex items-center gap-2 rounded-xl border border-orange/20 bg-cream/50 px-4 py-2.5 text-sm text-charcoal">
        <Info className="h-4 w-4 flex-shrink-0 text-orange" />
        <span>{PITCHING_ROUND_DESCRIPTIONS[round]}</span>
      </div>

      {storeQuery.isError && (
        <AlertCard variant="error" message={extractErrorMessage(storeQuery.error)} />
      )}
      {!cohortQuery.isLoading && !cohortQuery.isError && cohortRows.length === 0 && (
        <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.noRankedStore} />
      )}
      {reportQuery.isError && (
        <AlertCard variant="error" message={extractErrorMessage(reportQuery.error)} />
      )}

      {/* Four bands of two cards, paired by how tall their content runs — the
          short store card with the tile strip, the ten-row breakdown with the
          ten-row Top 10 — so no card is left holding a column of white space
          beside a much taller neighbour. Every panel is `h-full`, which is what
          makes the two cards in a band end level. */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {storeQuery.isLoading && <CardSkeleton />}
          {store && (
            <PitchingStoreCard store={store} level={report?.level ?? null} round={round} />
          )}
          {!storeId && (
            <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.noStoreSelected} />
          )}
        </div>

        <div className="lg:col-span-7">
          {reportQuery.isLoading && <CardSkeleton />}
          {!reportQuery.isLoading && report && <PitchingSummaryTiles report={report} />}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
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

        <div className="lg:col-span-4">
          <PitchingTopRanking
            rows={cohortRows}
            size={PITCHING_TOP_RANKING_SIZE}
            selectedStoreId={storeId}
            onSelectStore={handleStoreChange}
            isLoading={cohortQuery.isLoading}
            error={cohortQuery.isError ? cohortQuery.error : null}
          />
        </div>
      </div>

      {/* The judge table needs ~580px for its six columns, so it keeps the
          wider half of its band rather than growing a horizontal scrollbar. */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PitchingJudgeTable judges={judges} />
        </div>
        <div className="lg:col-span-5">
          {opinionJudge && (
            <PitchingJudgeOpinion pitching={opinionJudge} isJudgeAutoPicked={!activeJudge} />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PitchingCriteriaChart criteria={report?.criteria ?? []} />
        </div>
        <div className="lg:col-span-5">
          <PitchingScoreDistribution rows={cohortRows} />
        </div>
      </div>
    </>
  );
}
