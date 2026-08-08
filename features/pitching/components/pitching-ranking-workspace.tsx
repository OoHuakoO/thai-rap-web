'use client';

import { useState } from 'react';
import { BackLink } from '@/components/shared/back-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import {
  PITCHING_ROUND_DESCRIPTIONS,
  PITCHING_ROUND_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { PITCHING_ROUNDS } from '../types/pitching.types';
import { PitchingPageHeader } from './pitching-page-header';
import { PitchingReportPanel } from './pitching-report-panel';

export function PitchingRankingWorkspace() {
  const [round, setRound] = useState<string>(PITCHING_ROUNDS[0]);

  return (
    <Tabs value={round} onValueChange={setRound} className="space-y-4">
      <BackLink href={ROUTES.PITCHING}>{PITCHING_TEXT.backToDashboard}</BackLink>
      <PitchingPageHeader
        title={PITCHING_TEXT.rankingPageTitle}
        description={PITCHING_TEXT.rankingPageDescription}
      />

      <TabsList aria-label={PITCHING_TEXT.rankingPageTitle}>
        {PITCHING_ROUNDS.map((item) => (
          <TabsTrigger key={item} value={item}>
            {PITCHING_ROUND_LABELS[item]}
          </TabsTrigger>
        ))}
      </TabsList>

      {PITCHING_ROUNDS.map((item) => (
        <TabsContent key={item} value={item} className="space-y-4">
          <p className="text-sm text-charcoal">{PITCHING_ROUND_DESCRIPTIONS[item]}</p>
          <PitchingReportPanel round={item} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
