'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { PITCHING_TEXT } from '../constants/pitching.constants';
import { useSubmitPitching } from '../hooks/use-pitching-mutations';
import type {
  Pitching,
  PitchingCriterionScore,
  PitchingRecommendation,
  SubmitPitchingDto,
} from '../types/pitching.types';
import { evaluateMinimumConditions } from '../utils/pitching-minimum';
import { PitchingComments } from './pitching-comments';
import { PitchingCriteriaTable } from './pitching-criteria-table';
import { PitchingLevelBands } from './pitching-level-bands';
import { PitchingMinimumConditionsPanel } from './pitching-minimum-conditions';
import { PitchingScoreSummary } from './pitching-score-summary';
import { PitchingVerdict } from './pitching-verdict';

interface PitchingFormProps {
  pitching: Pitching;
}

interface PitchingDraft {
  scoreCardTotal: number | null;
  participationPct: number | null;
  evidenceChecked: string[];
  comments: Record<string, string>;
  recommendation: PitchingRecommendation | null;
  recommendationReason: string | null;
  noConflictOfInterest: boolean;
  criteria: PitchingCriterionScore[];
}

/**
 * The judge fills the whole form offline: every field lives in local state and
 * nothing reaches the database until ส่งแบบประเมิน, which writes the form in one
 * transaction. Mounted with `key={pitching.id}`, so the draft is seeded once and
 * a background refetch can never overwrite what is being typed.
 */
export function PitchingForm({ pitching }: PitchingFormProps) {
  const confirm = useConfirm();
  const { round, storeId, id } = pitching;

  const [draft, setDraft] = useState<PitchingDraft>(() => toDraft(pitching));
  const { mutate: submitForm, isPending: isSubmitting } = useSubmitPitching(id, storeId, round);

  const patch = (data: Partial<PitchingDraft>) => setDraft((current) => ({ ...current, ...data }));

  const patchCriterion = (criterionId: number, data: Partial<PitchingCriterionScore>) =>
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === criterionId ? { ...criterion, ...data } : criterion
      ),
    }));

  const handleSubmit = async () => {
    const confirmed = await confirm({
      title: PITCHING_TEXT.submitConfirmTitle,
      description: PITCHING_TEXT.submitConfirmDescription,
      confirmLabel: PITCHING_TEXT.submitConfirmLabel,
    });
    if (!confirmed) return;

    submitForm(toSubmitDto(pitching, draft), {
      onSuccess: () => toast.success(PITCHING_TEXT.submitSuccess),
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-4">
      {round === 'ACCELERATION' && (
        <PitchingMinimumConditionsPanel
          conditions={evaluateMinimumConditions(draft.scoreCardTotal, draft.participationPct)}
          evidenceChecked={draft.evidenceChecked}
          onScoreCardChange={(scoreCardTotal) => patch({ scoreCardTotal })}
          onParticipationChange={(participationPct) => patch({ participationPct })}
          onEvidenceChange={(evidenceChecked) => patch({ evidenceChecked })}
        />
      )}

      <PitchingScoreSummary round={round} criteria={draft.criteria} />

      <PitchingCriteriaTable
        criteria={draft.criteria}
        onScoreChange={(criterionId, score) => patchCriterion(criterionId, { score })}
        onNoteChange={(criterionId, note) => patchCriterion(criterionId, { note })}
      />

      <PitchingLevelBands round={round} />

      <PitchingComments
        round={round}
        comments={draft.comments}
        onCommit={(key, value) => patch({ comments: { ...draft.comments, [key]: value } })}
      />

      <PitchingVerdict
        round={round}
        recommendation={draft.recommendation}
        reason={draft.recommendationReason}
        noConflictOfInterest={draft.noConflictOfInterest}
        onRecommendationChange={(recommendation) => patch({ recommendation })}
        onReasonCommit={(recommendationReason) => patch({ recommendationReason })}
        onConflictChange={(noConflictOfInterest) => patch({ noConflictOfInterest })}
      />

      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">{PITCHING_TEXT.unsavedHint}</span>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? PITCHING_TEXT.submitting : PITCHING_TEXT.submit}
        </Button>
      </div>
    </div>
  );
}

function toDraft(pitching: Pitching): PitchingDraft {
  return {
    scoreCardTotal: pitching.minimumConditions?.scoreCardTotal ?? null,
    participationPct: pitching.minimumConditions?.participationPct ?? null,
    evidenceChecked: pitching.evidenceChecked,
    comments: pitching.comments,
    recommendation: pitching.recommendation,
    recommendationReason: pitching.recommendationReason,
    noConflictOfInterest: pitching.noConflictOfInterest,
    criteria: pitching.criteria,
  };
}

function toSubmitDto(pitching: Pitching, draft: PitchingDraft): SubmitPitchingDto {
  const isAcceleration = pitching.round === 'ACCELERATION';

  return {
    comments: draft.comments,
    recommendation: draft.recommendation ?? undefined,
    recommendationReason: draft.recommendationReason ?? undefined,
    noConflictOfInterest: draft.noConflictOfInterest,
    // The two readings, the evidence checklist and หลักฐาน/ข้อสังเกต only exist
    // on the acceleration form — the API rejects them on a pitch deck payload.
    ...(isAcceleration
      ? {
          scoreCardTotal: draft.scoreCardTotal,
          participationPct: draft.participationPct,
          evidenceChecked: draft.evidenceChecked,
        }
      : {}),
    scores: draft.criteria.map((criterion) => ({
      criterionId: criterion.id,
      score: criterion.score,
      ...(isAcceleration ? { note: criterion.note ?? '' } : {}),
    })),
  };
}
