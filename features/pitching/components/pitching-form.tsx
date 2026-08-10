'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
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

// The same five slots, worded for a first submission and for a correction of
// one already in the ranking.
const SUBMIT_TEXT = {
  action: PITCHING_TEXT.submit,
  pending: PITCHING_TEXT.submitting,
  confirmTitle: PITCHING_TEXT.submitConfirmTitle,
  confirmDescription: PITCHING_TEXT.submitConfirmDescription,
  confirmLabel: PITCHING_TEXT.submitConfirmLabel,
  success: PITCHING_TEXT.submitSuccess,
} as const;

const RESUBMIT_TEXT = {
  action: PITCHING_TEXT.resubmit,
  pending: PITCHING_TEXT.resubmitting,
  confirmTitle: PITCHING_TEXT.resubmitConfirmTitle,
  confirmDescription: PITCHING_TEXT.resubmitConfirmDescription,
  confirmLabel: PITCHING_TEXT.resubmitConfirmLabel,
  success: PITCHING_TEXT.resubmitSuccess,
} as const;

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
  const router = useRouter();
  const { round, storeId, id } = pitching;
  // Submitting does not lock the form, so a resubmit is a correction of a score
  // the ranking already averages — it needs its own wording, not a first
  // submission's.
  const isResubmit = pitching.status === 'SUBMITTED';
  const text = isResubmit ? RESUBMIT_TEXT : SUBMIT_TEXT;

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

  // Merged off `current`, not off the `draft` this render closed over: each
  // comment box commits on blur, and a blur that lands before React has
  // re-rendered would otherwise write a map missing the previous box's answer.
  const patchComment = (key: string, value: string) =>
    setDraft((current) => ({ ...current, comments: { ...current.comments, [key]: value } }));

  const handleSubmit = async () => {
    const confirmed = await confirm({
      title: text.confirmTitle,
      description: text.confirmDescription,
      confirmLabel: text.confirmLabel,
    });
    if (!confirmed) return;

    submitForm(toSubmitDto(pitching, draft), {
      onSuccess: () => {
        toast.success(text.success);
        router.push(ROUTES.PITCHING);
      },
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-4">
      {isResubmit && <AlertCard variant="info" message={PITCHING_TEXT.resubmitNotice} />}

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

      <PitchingComments round={round} comments={draft.comments} onCommit={patchComment} />

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
          {isSubmitting ? text.pending : text.action}
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
