'use client';

import { Store as StoreIcon } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { buildFileUrl } from '@/utils/build-file-url';
import { STORE_STATUS_VARIANT } from '../constants/store-status-variant.constants';
import { STORE_STATUS_LABELS } from '@/features/store';
import type { Store } from '@/features/store';
import { STORE_UNSPECIFIED_LABEL } from '@/constants';

interface ScoreSummaryStoreHeaderProps {
  store: Store;
}

export function ScoreSummaryStoreHeader({ store }: ScoreSummaryStoreHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b pb-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream">
        {store.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildFileUrl(store.coverUrl)}
            alt={store.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <StoreIcon className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-charcoal">{store.name}</p>
        <p className="truncate text-[11.5px] text-muted-foreground">
          {store.province ?? STORE_UNSPECIFIED_LABEL}
        </p>
      </div>
      <StatusBadge
        status={STORE_STATUS_VARIANT[store.status]}
        label={STORE_STATUS_LABELS[store.status]}
      />
    </div>
  );
}
