'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  PITCHING_RECOMMENDATION_LABELS,
  PITCHING_RECOMMENDATION_OPTIONS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingRecommendation, PitchingRound } from '../types/pitching.types';

interface PitchingVerdictProps {
  round: PitchingRound;
  recommendation: PitchingRecommendation | null;
  reason: string | null;
  noConflictOfInterest: boolean;
  onRecommendationChange: (value: PitchingRecommendation) => void;
  onReasonCommit: (value: string) => void;
  onConflictChange: (value: boolean) => void;
}

export function PitchingVerdict({
  round,
  recommendation,
  reason,
  noConflictOfInterest,
  onRecommendationChange,
  onReasonCommit,
  onConflictChange,
}: PitchingVerdictProps) {
  const [draftReason, setDraftReason] = useState(reason ?? '');

  useEffect(() => {
    setDraftReason(reason ?? '');
  }, [reason]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{PITCHING_TEXT.verdictTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={recommendation ?? ''}
          onValueChange={(value) => onRecommendationChange(value as PitchingRecommendation)}
          className="space-y-2"
        >
          {PITCHING_RECOMMENDATION_OPTIONS[round].map((option) => (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem value={option} id={`pitching-verdict-${option}`} />
              <Label htmlFor={`pitching-verdict-${option}`} className="font-normal">
                {PITCHING_RECOMMENDATION_LABELS[option]}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-1.5">
          <Label htmlFor="pitching-verdict-reason">{PITCHING_TEXT.verdictReasonLabel}</Label>
          <Textarea
            id="pitching-verdict-reason"
            rows={3}
            value={draftReason}
            placeholder={PITCHING_TEXT.verdictReasonPlaceholder}
            onChange={(event) => setDraftReason(event.target.value)}
            onBlur={() => {
              if (draftReason === (reason ?? '')) return;
              onReasonCommit(draftReason);
            }}
          />
        </div>

        {round === 'ACCELERATION' && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={noConflictOfInterest}
              onCheckedChange={(checked) => onConflictChange(checked === true)}
            />
            {PITCHING_TEXT.noConflictLabel}
          </label>
        )}
      </CardContent>
    </Card>
  );
}
