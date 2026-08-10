'use client';

import { Store as StoreIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { buildFileUrl } from '@/utils/build-file-url';
import {
  PITCHING_AVG_SCORE_DECIMALS,
  PITCHING_DASHBOARD_TEXT,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';

// Podium colours for the first three places; every other rank renders plain.
// Bronze uses the brand orange tokens, not Tailwind's `orange-*` scale — the
// theme replaces that scale with a single `orange`, so `orange-700` is no
// colour at all and the third medal renders white on white.
const MEDAL_CLASSES: Record<number, string> = {
  1: 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm',
  2: 'bg-gradient-to-br from-gray-200 to-gray-400 text-white shadow-sm',
  3: 'bg-gradient-to-br from-orange-light to-orange-dark text-white shadow-sm',
};

interface PitchingRankingListProps {
  rows: PitchingRankingRow[];
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
  /** The dialog has room for the province line; the dashboard card does not. */
  showProvince?: boolean;
  className?: string;
}

/**
 * The ranking read as a list of rows — shared by the dashboard's Top 10 card
 * and the full-ranking dialog, so a thumbnail or a medal colour is described
 * once and both surfaces stay identical.
 */
export function PitchingRankingList({
  rows,
  selectedStoreId,
  onSelectStore,
  showProvince = false,
  className,
}: PitchingRankingListProps) {
  return (
    <>
      <div className="flex items-center gap-3 border-b pb-2 text-xs text-muted-foreground">
        <span className="w-7 flex-shrink-0">{PITCHING_TEXT.rankColumn}</span>
        <span className="min-w-0 flex-1">{PITCHING_TEXT.storeColumn}</span>
        <span className="flex-shrink-0">{PITCHING_TEXT.avgScoreColumn}</span>
      </div>

      <ul className={cn('space-y-0.5', className)}>
        {rows.map((row) => (
          <li key={row.storeId}>
            <button
              type="button"
              onClick={() => onSelectStore(row.storeId)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:bg-muted/50',
                row.storeId === selectedStoreId &&
                  'border-orange/25 bg-orange/[0.08] hover:bg-orange/[0.08]'
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  MEDAL_CLASSES[row.rank] ?? 'bg-muted text-muted-foreground'
                )}
              >
                {row.rank}
              </span>

              <StoreThumbnail coverUrl={row.coverUrl} storeName={row.storeName} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-text-main">{row.storeName}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {showProvince && row.province
                    ? `${row.storeCode} · ${row.province}`
                    : row.storeCode}
                </span>
              </span>

              <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-orange">
                {row.avgScore.toFixed(PITCHING_AVG_SCORE_DECIMALS)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

interface StoreThumbnailProps {
  coverUrl: string | null;
  storeName: string;
}

function StoreThumbnail({ coverUrl, storeName }: StoreThumbnailProps) {
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-orange/15 bg-cream">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={buildFileUrl(coverUrl)}
          alt={PITCHING_DASHBOARD_TEXT.storePhotoAlt(storeName)}
          className="h-full w-full object-cover"
        />
      ) : (
        <StoreIcon className="h-4 w-4 text-orange/50" />
      )}
    </span>
  );
}
