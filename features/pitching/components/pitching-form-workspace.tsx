'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackLink } from '@/components/shared/back-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import {
  PITCHING_ROUND_DESCRIPTIONS,
  PITCHING_ROUND_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { PITCHING_ROUNDS } from '../types/pitching.types';
import { PitchingFormPanel } from './pitching-form-panel';
import { PitchingPageHeader } from './pitching-page-header';

export function PitchingFormWorkspace() {
  // The dashboard's "กรอกคะแนน" tile carries the store and round it was showing,
  // so the judge lands on that form instead of re-picking both here.
  const params = useSearchParams();
  const requestedRound = params.get('round');
  const initialStoreId = params.get('storeId') ?? '';

  const [round, setRound] = useState<string>(
    PITCHING_ROUNDS.find((item) => item === requestedRound) ?? PITCHING_ROUNDS[0]
  );

  return (
    <Tabs value={round} onValueChange={setRound} className="space-y-4">
      <BackLink href={ROUTES.PITCHING}>{PITCHING_TEXT.backToDashboard}</BackLink>
      <PitchingPageHeader
        title={PITCHING_TEXT.formPageTitle}
        description={PITCHING_TEXT.formPageDescription}
      />

      <TabsList aria-label={PITCHING_TEXT.formPageTitle}>
        {PITCHING_ROUNDS.map((item) => (
          <TabsTrigger key={item} value={item}>
            {PITCHING_ROUND_LABELS[item]}
          </TabsTrigger>
        ))}
      </TabsList>

      {PITCHING_ROUNDS.map((item) => (
        <TabsContent key={item} value={item} className="space-y-4">
          <p className="text-sm text-charcoal">{PITCHING_ROUND_DESCRIPTIONS[item]}</p>
          <PitchingFormPanel round={item} initialStoreId={initialStoreId} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
