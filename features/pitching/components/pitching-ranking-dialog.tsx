'use client';

import { useEffect, useState } from 'react';
import { AlertCard } from '@/components/shared/alert-card';
import { PaginationBar } from '@/components/shared/pagination-bar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PITCHING_DASHBOARD_TEXT,
  PITCHING_RANKING_DIALOG_PAGE_LIMIT,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';
import { PitchingRankingList } from './pitching-ranking-list';

interface PitchingRankingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The round's whole cohort — the dashboard already holds it, so paging here costs no request. */
  rows: PitchingRankingRow[];
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
}

/**
 * The Top 10 card shows the podium; this opens the rest of the same cohort in
 * place, paged, rather than sending the judge to another route and losing the
 * store and round they were looking at.
 */
export function PitchingRankingDialog({
  open,
  onOpenChange,
  rows,
  selectedStoreId,
  onSelectStore,
}: PitchingRankingDialogProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(PITCHING_RANKING_DIALOG_PAGE_LIMIT);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  // A round switched behind the open dialog can leave the cohort shorter than
  // the page being read, which would render an empty list with no way back.
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pageRows = rows.slice((page - 1) * limit, page * limit);

  const handleSelectStore = (storeId: string) => {
    onSelectStore(storeId);
    onOpenChange(false);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-base">
            {PITCHING_DASHBOARD_TEXT.rankingDialogTitle}
          </DialogTitle>
          <DialogDescription>{PITCHING_DASHBOARD_TEXT.rankingDialogDescription}</DialogDescription>
        </DialogHeader>

        {total === 0 ? (
          <AlertCard variant="info" message={PITCHING_TEXT.rankingEmpty} />
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              <PitchingRankingList
                rows={pageRows}
                selectedStoreId={selectedStoreId}
                onSelectStore={handleSelectStore}
                showProvince
              />
            </div>

            <PaginationBar
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
              itemLabel={PITCHING_TEXT.rankingItemLabel}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
