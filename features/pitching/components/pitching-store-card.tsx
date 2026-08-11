'use client';

import Link from 'next/link';
import { ClipboardPen, MapPin, Phone, Store as StoreIcon, User, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { STORE_UNSPECIFIED_LABEL } from '@/constants';
import { ROUTES } from '@/constants/routes';
import type { Store } from '@/features/store';
import { useAuthStore } from '@/stores/auth-store';
import { PITCHING_DASHBOARD_TEXT } from '../constants/pitching.constants';
import type { PitchingLevel, PitchingRound } from '../types/pitching.types';
import { PitchingLevelBadge } from './pitching-level-badge';
import { PitchingStoreThumbnail } from './pitching-store-thumbnail';
import { PitchingPanel } from './pitching-panel';

interface PitchingStoreCardProps {
  store: Store;
  level: PitchingLevel | null;
  /** The round the tile opens the form on — the one the dashboard is showing. */
  round: PitchingRound;
}

export function PitchingStoreCard({ store, level, round }: PitchingStoreCardProps) {
  const cover = store.coverUrl ?? store.storePhotos[0] ?? null;
  // A link, so it is gated on the route rather than on `pitching:write` alone —
  // the form route admits a narrower set of roles than the permission does.
  const canRoute = useAuthStore((state) => state.canRoute);

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.storeCardTitle}
      icon={StoreIcon}
      accent="orange"
      contentClassName="gap-4 bg-gradient-to-br from-cream-light to-white"
    >
      <div className="flex flex-wrap items-start gap-4">
        <PitchingStoreThumbnail coverUrl={cover} alt={store.name} size="lg" />

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-lg font-bold text-text-main" title={store.name}>
            {store.name}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{store.code}</p>
          {level && <PitchingLevelBadge level={level} />}
        </div>

        {canRoute(ROUTES.PITCHING_FORM) && (
          <Link
            href={ROUTES.PITCHING_FORM_FOR(store.id, round)}
            className="flex flex-shrink-0 items-center gap-2.5 self-center rounded-xl border border-orange/20 bg-cream px-3.5 py-2.5 transition-colors hover:border-orange/40 hover:bg-cream-light"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <ClipboardPen className="h-4 w-4" />
            </span>
            <span className="min-w-0 text-sm font-semibold text-text-main">
              {PITCHING_DASHBOARD_TEXT.fillScore}
            </span>
          </Link>
        )}
      </div>

      <div className="grid gap-2 xl:grid-cols-2">
        <StoreFact icon={MapPin} value={store.province} />
        <StoreFact icon={Utensils} value={store.storeType} />
        <StoreFact icon={User} label={PITCHING_DASHBOARD_TEXT.ownerLabel} value={store.ownerName} />
        <StoreFact icon={Phone} label={PITCHING_DASHBOARD_TEXT.phoneLabel} value={store.phone} />
      </div>
    </PitchingPanel>
  );
}

interface StoreFactProps {
  icon: LucideIcon;
  label?: string;
  value: string | null;
}

function StoreFact({ icon: Icon, label, value }: StoreFactProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-orange/10 bg-white/70 px-3 py-2">
      <Icon className="h-4 w-4 flex-shrink-0 text-orange" />
      <div className="min-w-0">
        {label && <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>}
        <p className="truncate text-sm text-text-main" title={value ?? STORE_UNSPECIFIED_LABEL}>
          {value ?? STORE_UNSPECIFIED_LABEL}
        </p>
      </div>
    </div>
  );
}
