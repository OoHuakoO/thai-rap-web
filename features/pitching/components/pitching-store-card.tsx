'use client';

import Link from 'next/link';
import { ClipboardPen, Store as StoreIcon, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STORE_UNSPECIFIED_LABEL } from '@/constants';
import { ROUTES } from '@/constants/routes';
import type { Store } from '@/features/store';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { buildFileUrl } from '@/utils/build-file-url';
import {
  PITCHING_DASHBOARD_TEXT,
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_LABELS,
} from '../constants/pitching.constants';
import type { PitchingLevel } from '../types/pitching.types';

interface PitchingStoreCardProps {
  store: Store;
  level: PitchingLevel | null;
}

export function PitchingStoreCard({ store, level }: PitchingStoreCardProps) {
  const canWrite = useAuthStore((state) => state.can(PERMISSIONS.PITCHING_WRITE));
  const cover = store.coverUrl ?? store.storePhotos[0] ?? null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {PITCHING_DASHBOARD_TEXT.storeCardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildFileUrl(cover)}
              alt={store.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <StoreIcon className="h-6 w-6 text-muted-foreground/60" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-text-main">{store.name}</p>
            {level && (
              <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[level]}>
                {PITCHING_LEVEL_LABELS[level]}
              </Badge>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{store.province ?? STORE_UNSPECIFIED_LABEL}</span>
            <span className="flex items-center gap-1">
              <Utensils className="h-3.5 w-3.5" />
              {store.storeType ?? STORE_UNSPECIFIED_LABEL}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {PITCHING_DASHBOARD_TEXT.ownerLabel} : {store.ownerName ?? STORE_UNSPECIFIED_LABEL}
          </p>
          <p className="text-sm text-muted-foreground">
            {PITCHING_DASHBOARD_TEXT.phoneLabel} : {store.phone ?? STORE_UNSPECIFIED_LABEL}
          </p>
        </div>

        {canWrite && (
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col items-start gap-0.5 border-orange/30 bg-cream/60 px-4 py-3 text-left hover:bg-cream"
          >
            <Link href={ROUTES.PITCHING_FORM}>
              <span className="flex items-center gap-2 font-semibold text-orange">
                <ClipboardPen className="h-4 w-4" />
                {PITCHING_DASHBOARD_TEXT.fillScore}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {PITCHING_DASHBOARD_TEXT.fillScoreHint}
              </span>
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
