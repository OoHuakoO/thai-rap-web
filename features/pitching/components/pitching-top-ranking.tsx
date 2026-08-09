'use client';

import { useState } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { PITCHING_DASHBOARD_TEXT, PITCHING_TEXT } from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';
import { PitchingPanel } from './pitching-panel';
import { PitchingRankingDialog } from './pitching-ranking-dialog';
import { PitchingRankingList } from './pitching-ranking-list';

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
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.topRankingTitle}
      subtitle={PITCHING_DASHBOARD_TEXT.topRankingSubtitle(size)}
      icon={Trophy}
      accent="purple"
      contentClassName="gap-2"
    >
      {isLoading && <CardSkeleton />}
      {!isLoading && error != null && (
        <AlertCard variant="error" message={extractErrorMessage(error)} />
      )}
      {!isLoading && error == null && rows.length === 0 && (
        <AlertCard variant="info" message={PITCHING_TEXT.rankingEmpty} />
      )}

      {!isLoading && error == null && rows.length > 0 && (
        <>
          {/* flex-1 on the list, not on the card body: a cohort of two rows
              still ends with the "ดูอันดับทั้งหมด" button on the bottom edge
              rather than stranded halfway up an empty card. */}
          <PitchingRankingList
            rows={rows.slice(0, size)}
            selectedStoreId={selectedStoreId}
            onSelectStore={onSelectStore}
            className="flex-1"
          />

          <button
            type="button"
            onClick={() => setIsRankingOpen(true)}
            className="flex items-center justify-center gap-1 rounded-lg border border-orange/20 bg-cream/60 py-2 text-sm font-medium text-orange transition-colors hover:bg-cream"
          >
            {PITCHING_DASHBOARD_TEXT.viewAllRanking}
            <ArrowRight className="h-4 w-4" />
          </button>

          <PitchingRankingDialog
            open={isRankingOpen}
            onOpenChange={setIsRankingOpen}
            rows={rows}
            selectedStoreId={selectedStoreId}
            onSelectStore={onSelectStore}
          />
        </>
      )}
    </PitchingPanel>
  );
}
