'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/shared/loading';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useStores } from '@/features/store';
import { EMPTY_STORE_MESSAGE } from '../constants/assessment-text.constants';
import { useAssessmentSummaries } from '../hooks/use-assessment';
import { ROUNDS } from '../types/assessment.types';

export function AssessmentEntry() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useStores({ limit: 1 });
  const firstStore = data?.items[0];
  const {
    data: summaries,
    isError: isSummariesError,
    error: summariesError,
  } = useAssessmentSummaries(firstStore?.id ?? '');

  useEffect(() => {
    if (!firstStore || !summaries) return;
    const currentRound =
      ROUNDS.find((round) => summaries.find((s) => s.round === round)?.status !== 'SUBMITTED') ??
      ROUNDS[ROUNDS.length - 1];
    router.replace(ROUTES.ASSESSMENT_DETAIL(firstStore.id, currentRound));
  }, [firstStore, summaries, router]);

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>;
  }

  if (isSummariesError) {
    return (
      <p className="py-8 text-center text-destructive">{extractErrorMessage(summariesError)}</p>
    );
  }

  if (!isLoading && data && !firstStore) {
    return <p className="py-8 text-center text-muted-foreground">{EMPTY_STORE_MESSAGE}</p>;
  }

  return <Loading className="py-16" />;
}
