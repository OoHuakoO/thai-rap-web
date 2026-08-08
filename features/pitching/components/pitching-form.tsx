'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_LABELS,
  PITCHING_STATUS_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import {
  useSubmitPitching,
  useUpdatePitching,
  useUpdatePitchingScore,
} from '../hooks/use-pitching-mutations';
import type { Pitching, UpdatePitchingDto } from '../types/pitching.types';
import { PitchingComments } from './pitching-comments';
import { PitchingCriteriaTable } from './pitching-criteria-table';
import { PitchingMinimumConditionsPanel } from './pitching-minimum-conditions';
import { PitchingVerdict } from './pitching-verdict';

interface PitchingFormProps {
  pitching: Pitching;
}

export function PitchingForm({ pitching }: PitchingFormProps) {
  const confirm = useConfirm();
  const { round, storeId, id } = pitching;

  const { mutate: updateForm, isPending: isSaving } = useUpdatePitching(id, storeId, round);
  const { mutate: updateScore } = useUpdatePitchingScore(id, storeId, round);
  const { mutate: submitForm, isPending: isSubmitting } = useSubmitPitching(id, storeId, round);

  const isLocked = pitching.status === 'SUBMITTED';

  const patch = (data: UpdatePitchingDto) =>
    updateForm(data, { onError: (error) => toast.error(extractErrorMessage(error)) });

  const handleSubmit = async () => {
    const confirmed = await confirm({
      title: PITCHING_TEXT.submitConfirmTitle,
      description: PITCHING_TEXT.submitConfirmDescription,
      confirmLabel: PITCHING_TEXT.submitConfirmLabel,
    });
    if (!confirmed) return;

    submitForm(undefined, {
      onSuccess: () => toast.success(PITCHING_TEXT.submitSuccess),
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-4">
      {isLocked ? (
        <AlertCard variant="success" message={PITCHING_TEXT.submittedNotice} />
      ) : (
        <AlertCard variant="info" message={PITCHING_TEXT.storeStatusNotice} />
      )}

      <PitchingFormHeader pitching={pitching} disabled={isLocked} onPatch={patch} />

      {pitching.minimumConditions && (
        <PitchingMinimumConditionsPanel
          conditions={pitching.minimumConditions}
          evidenceChecked={pitching.evidenceChecked}
          disabled={isLocked}
          onScoreCardChange={(scoreCardTotal) => patch({ scoreCardTotal })}
          onParticipationChange={(participationPct) => patch({ participationPct })}
          onEvidenceChange={(evidenceChecked) => patch({ evidenceChecked })}
        />
      )}

      <PitchingCriteriaTable
        criteria={pitching.criteria}
        disabled={isLocked}
        onScoreChange={(criterionId, score) =>
          updateScore(
            { criterionId, score },
            { onError: (error) => toast.error(extractErrorMessage(error)) }
          )
        }
        onNoteChange={(criterionId, note) =>
          updateScore(
            { criterionId, note },
            { onError: (error) => toast.error(extractErrorMessage(error)) }
          )
        }
      />

      <PitchingComments
        round={round}
        comments={pitching.comments}
        disabled={isLocked}
        onCommit={(key, value) => patch({ comments: { ...pitching.comments, [key]: value } })}
      />

      <PitchingVerdict
        round={round}
        recommendation={pitching.recommendation}
        reason={pitching.recommendationReason}
        noConflictOfInterest={pitching.noConflictOfInterest}
        disabled={isLocked}
        onRecommendationChange={(recommendation) => patch({ recommendation })}
        onReasonCommit={(recommendationReason) => patch({ recommendationReason })}
        onConflictChange={(noConflictOfInterest) => patch({ noConflictOfInterest })}
      />

      {!isLocked && (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-muted-foreground">
            {isSaving ? PITCHING_TEXT.saving : ''}
          </span>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? PITCHING_TEXT.submitting : PITCHING_TEXT.submit}
          </Button>
        </div>
      )}
    </div>
  );
}

interface PitchingFormHeaderProps {
  pitching: Pitching;
  disabled: boolean;
  onPatch: (data: UpdatePitchingDto) => void;
}

function PitchingFormHeader({ pitching, disabled, onPatch }: PitchingFormHeaderProps) {
  const [prototype, setPrototype] = useState(pitching.prototypeProduct ?? '');
  const evaluatedAt = toDateInputValue(pitching.evaluatedAt);

  useEffect(() => {
    setPrototype(pitching.prototypeProduct ?? '');
  }, [pitching.prototypeProduct]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-semibold">{PITCHING_TEXT.headerTitle}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{PITCHING_STATUS_LABELS[pitching.status]}</Badge>
          {pitching.level && (
            <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[pitching.level]}>
              {PITCHING_LEVEL_LABELS[pitching.level]}
            </Badge>
          )}
          <span className="text-sm font-semibold text-orange">
            {PITCHING_TEXT.totalOutOf(pitching.totalScore ?? pitching.currentScore)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>{PITCHING_TEXT.judgeLabel}</Label>
          <Input value={pitching.judgeName} readOnly disabled />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pitching-evaluated-at">{PITCHING_TEXT.evaluatedAtLabel}</Label>
          <Input
            id="pitching-evaluated-at"
            type="date"
            value={evaluatedAt}
            disabled={disabled}
            onChange={(event) => {
              if (!event.target.value) return;
              onPatch({ evaluatedAt: new Date(event.target.value).toISOString() });
            }}
          />
        </div>

        {pitching.round === 'ACCELERATION' && (
          <div className="space-y-1.5">
            <Label htmlFor="pitching-prototype">{PITCHING_TEXT.prototypeProductLabel}</Label>
            <Input
              id="pitching-prototype"
              value={prototype}
              disabled={disabled}
              placeholder={PITCHING_TEXT.prototypeProductPlaceholder}
              onChange={(event) => setPrototype(event.target.value)}
              onBlur={() => {
                if (prototype === (pitching.prototypeProduct ?? '')) return;
                onPatch({ prototypeProduct: prototype });
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// <input type="date"> only accepts yyyy-MM-dd, and the API answers an ISO
// timestamp.
function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}
