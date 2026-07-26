'use client';

import { MapPin, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessmentRank } from '../hooks/use-assessment';
import { SCORE_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import type { Round } from '../types/assessment.types';

interface ScoreSummaryRankProps {
  storeId: string;
  /** The round the rank is read from — the store's latest completed one. */
  round: Round;
}

export function ScoreSummaryRank({ storeId, round }: ScoreSummaryRankProps) {
  const { data: rank, isLoading, isError } = useAssessmentRank(storeId, round);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
            <Skeleton className="h-8 w-8 flex-shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-2.5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg bg-muted/40 p-2.5 text-center text-[11.5px] text-muted-foreground">
        {SCORE_SUMMARY_TEXT.rankUnavailable}
      </p>
    );
  }

  if (!rank) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10.5px] text-muted-foreground">
            {SCORE_SUMMARY_TEXT.provinceRank}
          </p>
          <p className="text-sm font-extrabold text-dark-nav">
            {rank.provinceRank ?? '—'}
            <span className="text-[11.5px] font-normal text-muted-foreground">
              {' '}
              / {rank.provinceTotal}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
          <Trophy className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10.5px] text-muted-foreground">
            {SCORE_SUMMARY_TEXT.overallRank}
          </p>
          <p className="text-sm font-extrabold text-dark-nav">
            {rank.overallRank ?? '—'}
            <span className="text-[11.5px] font-normal text-muted-foreground">
              {' '}
              / {rank.overallTotal}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
