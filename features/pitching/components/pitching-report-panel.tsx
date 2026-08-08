'use client';

import { useState } from 'react';
import { AlertCard } from '@/components/shared/alert-card';
import {
  ALL_PROVINCES,
  PITCHING_RANKING_PAGE_LIMIT,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingRound } from '../types/pitching.types';
import { PitchingRankingTable } from './pitching-ranking-table';
import { PitchingStoreReportPanel } from './pitching-store-report';

interface PitchingReportPanelProps {
  round: PitchingRound;
}

export function PitchingReportPanel({ round }: PitchingReportPanelProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PITCHING_RANKING_PAGE_LIMIT);
  const [province, setProvince] = useState<string>(ALL_PROVINCES);
  const [storeId, setStoreId] = useState('');

  return (
    <div className="space-y-4">
      <PitchingRankingTable
        round={round}
        province={province}
        page={page}
        limit={limit}
        selectedStoreId={storeId}
        onProvinceChange={(next) => {
          setProvince(next);
          setPage(1);
        }}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onSelectStore={setStoreId}
      />

      {storeId ? (
        <PitchingStoreReportPanel storeId={storeId} round={round} />
      ) : (
        <AlertCard variant="info" message={PITCHING_TEXT.selectRankingRow} />
      )}
    </div>
  );
}
