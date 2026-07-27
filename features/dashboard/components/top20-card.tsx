'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCard } from '@/components/shared/alert-card';
import { TableSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { DEFAULT_TOP20_ROUND, TOP20_ROUND_OPTIONS } from '../constants/dashboard-display.constants';
import { TOP20_TEXT } from '../constants/dashboard-text.constants';
import { useTop20 } from '../hooks/use-top20';
import type { Top20RoundFilter } from '../types/dashboard.types';
import { CardFooterButton } from './card-footer-link';
import { Top20Dialog } from './top20-dialog';
import { TOP20_COLUMN_COUNT, Top20Table } from './top20-table';

const SKELETON_ROWS = 6;

export function Top20Card() {
  const [round, setRound] = useState<Top20RoundFilter>(DEFAULT_TOP20_ROUND);
  const [isFullListOpen, setFullListOpen] = useState(false);
  const { data: entries, isLoading, isError, error } = useTop20(round);
  const router = useRouter();
  // The ranking itself is part of the overview every staff role and VIEWER
  // sees, but /stores is narrower than that — drilling into a store is only
  // offered to the roles the route actually admits.
  const canOpenStore = useAuthStore((s) => s.canRoute(ROUTES.STORES));

  const handleRowClick = (storeId: string) => {
    if (!canOpenStore) return;
    router.push(ROUTES.STORE_DETAIL(storeId));
  };

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">{TOP20_TEXT.title}</CardTitle>
        <Select value={round} onValueChange={(value) => setRound(value as Top20RoundFilter)}>
          <SelectTrigger className="h-8 w-28 text-xs" aria-label={TOP20_TEXT.roundFilterLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOP20_ROUND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2 pb-3">
        {isLoading && <TableSkeleton rows={SKELETON_ROWS} cols={TOP20_COLUMN_COUNT} />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && (
          <div className="max-h-[200px] overflow-y-auto">
            <Top20Table
              entries={entries}
              canOpenStore={canOpenStore}
              onRowClick={handleRowClick}
            />
          </div>
        )}

        {!isLoading && !isError && !!entries?.length && (
          <div className="mt-auto flex justify-end pt-1">
            <CardFooterButton
              label={TOP20_TEXT.footerLink}
              onClick={() => setFullListOpen(true)}
            />
          </div>
        )}

        <Top20Dialog
          open={isFullListOpen}
          onOpenChange={setFullListOpen}
          entries={entries}
          canOpenStore={canOpenStore}
          onRowClick={handleRowClick}
        />
      </CardContent>
    </Card>
  );
}
