'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PITCHING_EVIDENCE_OPTIONS,
  PITCHING_SCORE_CARD_MAX,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingMinimumConditions } from '../types/pitching.types';

interface PitchingMinimumConditionsPanelProps {
  conditions: PitchingMinimumConditions;
  evidenceChecked: string[];
  disabled: boolean;
  onScoreCardChange: (value: number | null) => void;
  onParticipationChange: (value: number | null) => void;
  onEvidenceChange: (keys: string[]) => void;
}

export function PitchingMinimumConditionsPanel({
  conditions,
  evidenceChecked,
  disabled,
  onScoreCardChange,
  onParticipationChange,
  onEvidenceChange,
}: PitchingMinimumConditionsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {PITCHING_TEXT.minimumTitle}
          <Badge
            variant="outline"
            className={
              conditions.passed
                ? 'border-score-green/20 bg-score-green/10 text-score-green'
                : 'border-score-red/20 bg-score-red/10 text-score-red'
            }
          >
            {conditions.passed ? PITCHING_TEXT.minimumPassed : PITCHING_TEXT.minimumFailed}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{PITCHING_TEXT.minimumHint}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            id="pitching-score-card"
            label={PITCHING_TEXT.scoreCardLabel}
            hint={PITCHING_TEXT.scoreCardHint}
            value={conditions.scoreCardTotal}
            max={PITCHING_SCORE_CARD_MAX}
            passed={conditions.scoreCardPassed}
            disabled={disabled}
            onCommit={onScoreCardChange}
          />
          <NumberField
            id="pitching-participation"
            label={PITCHING_TEXT.participationLabel}
            hint={PITCHING_TEXT.participationHint}
            value={conditions.participationPct}
            max={100}
            passed={conditions.participationPassed}
            disabled={disabled}
            onCommit={onParticipationChange}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-main">{PITCHING_TEXT.evidenceTitle}</p>
          <div className="grid gap-2 md:grid-cols-3">
            {PITCHING_EVIDENCE_OPTIONS.map((option) => (
              <label key={option.key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={evidenceChecked.includes(option.key)}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    onEvidenceChange(
                      checked === true
                        ? [...evidenceChecked, option.key]
                        : evidenceChecked.filter((key) => key !== option.key)
                    )
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  hint: string;
  value: number | null;
  max: number;
  passed: boolean;
  disabled: boolean;
  onCommit: (value: number | null) => void;
}

function NumberField({
  id,
  label,
  hint,
  value,
  max,
  passed,
  disabled,
  onCommit,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(value === null ? '' : String(value));

  useEffect(() => {
    setDraft(value === null ? '' : String(value));
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          // An empty box clears the reading; the API then treats the condition
          // as unmet, which is exactly what an unrecorded value means.
          const parsed = draft === '' ? null : Number(draft);
          if (parsed !== null && (Number.isNaN(parsed) || parsed < 0 || parsed > max)) return;
          if (parsed === value) return;
          onCommit(parsed);
        }}
      />
      <p className={passed ? 'text-xs text-score-green' : 'text-xs text-muted-foreground'}>
        {hint}
      </p>
    </div>
  );
}
