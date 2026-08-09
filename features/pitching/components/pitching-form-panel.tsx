'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStores } from '@/features/store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { PITCHING_TEXT } from '../constants/pitching.constants';
import { useCreatePitching, useMyPitching } from '../hooks/use-my-pitching';
import type { PitchingRound } from '../types/pitching.types';
import { PitchingForm } from './pitching-form';

// The store list is already scoped server-side, so this picker offers exactly
// the stores the caller may score.
const STORE_PAGE_SIZE = 100;

interface PitchingFormPanelProps {
  round: PitchingRound;
}

export function PitchingFormPanel({ round }: PitchingFormPanelProps) {
  const { data, isLoading, isError, error } = useStores({ limit: STORE_PAGE_SIZE });
  const stores = data?.items ?? [];
  const [storeId, setStoreId] = useState('');

  useEffect(() => {
    if (!storeId && stores.length > 0) setStoreId(stores[0].id);
  }, [storeId, stores]);

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (stores.length === 0) return <AlertCard variant="info" message={PITCHING_TEXT.noStore} />;

  return (
    <div className="space-y-4">
      <div className="max-w-md space-y-1.5">
        <Label htmlFor="pitching-store">{PITCHING_TEXT.storeLabel}</Label>
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger id="pitching-store" aria-label={PITCHING_TEXT.storeLabel}>
            <SelectValue placeholder={PITCHING_TEXT.storePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {storeId ? (
        <PitchingFormLoader storeId={storeId} round={round} />
      ) : (
        <AlertCard variant="info" message={PITCHING_TEXT.selectStoreFirst} />
      )}
    </div>
  );
}

interface PitchingFormLoaderProps {
  storeId: string;
  round: PitchingRound;
}

function PitchingFormLoader({ storeId, round }: PitchingFormLoaderProps) {
  const { data: pitching, isLoading, isError, error } = useMyPitching(storeId, round);
  const { mutate: startForm, isPending } = useCreatePitching(storeId, round);

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;

  if (!pitching) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <p className="text-sm text-muted-foreground">{PITCHING_TEXT.startFormHint}</p>
          <Button
            disabled={isPending}
            onClick={() =>
              startForm(undefined, {
                onError: (err) => toast.error(extractErrorMessage(err)),
              })
            }
          >
            {PITCHING_TEXT.startForm}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Keyed so the buffered draft is seeded once per form — switching store or
  // round mounts a fresh one instead of merging into what was being typed.
  return <PitchingForm key={pitching.id} pitching={pitching} />;
}
