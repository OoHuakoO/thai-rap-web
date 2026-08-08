'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { PITCHING_DASHBOARD_TEXT, PITCHING_TEXT } from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';

// Podium colours for the first three places; every other rank renders plain.
const MEDAL_CLASSES: Record<number, string> = {
  1: 'bg-amber-400 text-white',
  2: 'bg-gray-300 text-white',
  3: 'bg-orange-700 text-white',
};

interface PitchingTopRankingProps {
  rows: PitchingRankingRow[];
  size: number;
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
  isLoading: boolean;
  error: unknown;
}

export function PitchingTopRanking({
  rows,
  size,
  selectedStoreId,
  onSelectStore,
  isLoading,
  error,
}: PitchingTopRankingProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {PITCHING_DASHBOARD_TEXT.topRankingTitle}{' '}
          <span className="font-normal text-muted-foreground">
            {PITCHING_DASHBOARD_TEXT.topRankingSubtitle(size)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <CardSkeleton />}
        {!isLoading && error != null && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}
        {!isLoading && error == null && rows.length === 0 && (
          <AlertCard variant="info" message={PITCHING_TEXT.rankingEmpty} />
        )}

        {!isLoading && error == null && rows.length > 0 && (
          <>
            <div className="flex items-center gap-3 border-b pb-2 text-xs text-muted-foreground">
              <span className="w-7 flex-shrink-0">{PITCHING_TEXT.rankColumn}</span>
              <span className="min-w-0 flex-1">{PITCHING_TEXT.storeColumn}</span>
              <span className="flex-shrink-0">{PITCHING_TEXT.avgScoreColumn}</span>
            </div>

            <ul>
              {rows.slice(0, size).map((row) => (
                <li key={row.storeId}>
                  <button
                    type="button"
                    onClick={() => onSelectStore(row.storeId)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-muted/40',
                      row.storeId === selectedStoreId && 'bg-orange/[0.08] hover:bg-orange/[0.08]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        MEDAL_CLASSES[row.rank] ?? 'text-muted-foreground'
                      )}
                    >
                      {row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-text-main">
                      {row.storeName}
                    </span>
                    <span className="flex-shrink-0 text-sm font-semibold tabular-nums">
                      {row.avgScore.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <Link
              href={ROUTES.PITCHING_RANKING}
              className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-orange hover:underline"
            >
              {PITCHING_DASHBOARD_TEXT.viewAllRanking}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
