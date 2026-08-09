'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';
import {
  PITCHING_EVIDENCE_OPTIONS,
  PITCHING_PARTICIPATION_MAX,
  PITCHING_SCORE_CARD_MAX,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingMinimumConditions } from '../types/pitching.types';

interface PitchingMinimumConditionsPanelProps {
  conditions: PitchingMinimumConditions;
  evidenceChecked: string[];
  onScoreCardChange: (value: number | null) => void;
  onParticipationChange: (value: number | null) => void;
  onEvidenceChange: (keys: string[]) => void;
}

export function PitchingMinimumConditionsPanel({
  conditions,
  evidenceChecked,
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
            integerOnly
            passed={conditions.scoreCardPassed}
            onCommit={onScoreCardChange}
          />
          <NumberField
            id="pitching-participation"
            label={PITCHING_TEXT.participationLabel}
            hint={PITCHING_TEXT.participationHint}
            value={conditions.participationPct}
            max={PITCHING_PARTICIPATION_MAX}
            integerOnly={false}
            passed={conditions.participationPassed}
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
  /** Score Card is an integer reading on the API; the participation % is not. */
  integerOnly: boolean;
  passed: boolean;
  onCommit: (value: number | null) => void;
}

function NumberField({
  id,
  label,
  hint,
  value,
  max,
  integerOnly,
  passed,
  onCommit,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(value === null ? '' : String(value));
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    setDraft(value === null ? '' : String(value));
  }, [value]);

  const errorId = `${id}-error`;

  // Same rule as the criteria table: a reading outside 0..max is refused as it
  // is typed rather than dropped on blur, so the box can never show a number the
  // draft is not actually carrying.
  const handleChange = (raw: string) => {
    if (raw === '') {
      // An empty box clears the reading; the API then treats the condition as
      // unmet, which is exactly what an unrecorded value means.
      setIsRejected(false);
      setDraft('');
      if (value !== null) onCommit(null);
      return;
    }

    const parsed = Number(raw);
    const isValid =
      Number.isFinite(parsed) &&
      parsed >= 0 &&
      parsed <= max &&
      (!integerOnly || Number.isInteger(parsed));
    if (!isValid) {
      setIsRejected(true);
      return;
    }

    setIsRejected(false);
    setDraft(raw);
    if (parsed !== value) onCommit(parsed);
  };

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
        aria-invalid={isRejected}
        aria-describedby={isRejected ? errorId : undefined}
        className={cn(isRejected && 'border-destructive')}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => setIsRejected(false)}
      />
      {isRejected ? (
        <p id={errorId} className="text-xs text-destructive">
          {integerOnly ? PITCHING_TEXT.scoreOutOfRange(max) : PITCHING_TEXT.valueOutOfRange(max)}
        </p>
      ) : (
        <p className={passed ? 'text-xs text-score-green' : 'text-xs text-muted-foreground'}>
          {hint}
        </p>
      )}
    </div>
  );
}
