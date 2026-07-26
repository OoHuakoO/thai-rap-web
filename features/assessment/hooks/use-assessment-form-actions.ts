'use client';

import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAlert, useConfirm } from '@/components/shared/confirm-dialog';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  assessmentKeys,
  useDeleteEvidence,
  useSaveDraft,
  useSubmitAssessment,
  useUpdateScore,
  useUploadEvidence,
} from './use-assessment';
import { ASSESSMENT_FORM_TEXT } from '../constants/assessment-text.constants';
import type { Assessment, Round, UpdateScoreDto } from '../types/assessment.types';

const HIGHLIGHT_DURATION_MS = 2500;

interface UseAssessmentFormActionsParams {
  storeId: string;
  round: Round;
  /** Undefined until the round's assessment has loaded — every handler no-ops until then. */
  assessment: Assessment | undefined;
  dimensionCount: number;
  selectedDim: number;
  onSelectDim: (dimensionId: number) => void;
  onHighlightQuestion: (questionId: number | null) => void;
}

// The write side of AssessmentForm: every mutation the form fires plus the
// toast/confirm wiring around it. Kept out of the component so the component is
// the layout and this is the behaviour.
export function useAssessmentFormActions({
  storeId,
  round,
  assessment,
  dimensionCount,
  selectedDim,
  onSelectDim,
  onHighlightQuestion,
}: UseAssessmentFormActionsParams) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const alert = useAlert();

  const assessmentId = assessment?.id ?? '';
  const updateScore = useUpdateScore(storeId, round, assessmentId);
  const saveDraft = useSaveDraft(storeId, round, assessmentId);
  const submitAssessment = useSubmitAssessment(storeId, round, assessmentId);
  const uploadEvidence = useUploadEvidence(storeId, round, assessmentId);
  const deleteEvidence = useDeleteEvidence(storeId, round, assessmentId);

  // Shared by score/note/suggestion changes: find the question, fall back to
  // its existing fields for whatever the caller didn't change, and skip the
  // write if there's no score yet (note/suggestion inputs are disabled in
  // that state, but this guard covers the call site too).
  const saveScore = (
    questionId: number,
    patch: Partial<Pick<UpdateScoreDto, 'rawScore' | 'note' | 'suggestion'>>
  ) => {
    if (!assessment) return;
    const question = assessment.questions.find((q) => q.questionId === questionId);
    const rawScore = patch.rawScore ?? question?.rawScore;
    if (rawScore === null || rawScore === undefined) return;
    updateScore.mutate(
      {
        questionId,
        rawScore,
        note: patch.note ?? question?.note ?? undefined,
        suggestion: patch.suggestion ?? question?.suggestion ?? undefined,
      },
      { onError: (err) => toast.error(extractErrorMessage(err)) }
    );
  };

  const handleScoreChange = (questionId: number, score: number) =>
    saveScore(questionId, { rawScore: score });

  const handleNoteChange = (questionId: number, note: string) => saveScore(questionId, { note });

  const handleSuggestionChange = (questionId: number, suggestion: string) =>
    saveScore(questionId, { suggestion });

  const handleUploadEvidence = (questionId: number, file: File) => {
    uploadEvidence.mutate(
      { questionId, file },
      {
        onSuccess: () => toast.success(ASSESSMENT_FORM_TEXT.fileAttached(file.name)),
        onError: (err) => toast.error(extractErrorMessage(err)),
      }
    );
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    const confirmed = await confirm({
      title: ASSESSMENT_FORM_TEXT.deleteEvidenceTitle,
      description: ASSESSMENT_FORM_TEXT.deleteEvidenceDescription,
      confirmLabel: ASSESSMENT_FORM_TEXT.deleteEvidenceTitle,
      variant: 'destructive',
    });
    if (!confirmed) return;
    deleteEvidence.mutate(evidenceId, {
      onSuccess: () => toast.success(ASSESSMENT_FORM_TEXT.fileDeleted),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  // Scores are already written on every change, so this doesn't re-send them —
  // it marks the round as worked-on-but-unfinished, which is the "ยังไม่สมบูรณ์"
  // half of the two save modes.
  const handleSaveDraft = () => {
    if (!assessment) return;
    const scoredCount = assessment.questions.filter((q) => q.rawScore !== null).length;
    saveDraft.mutate(undefined, {
      onSuccess: () =>
        toast.success(ASSESSMENT_FORM_TEXT.draftSaved(scoredCount, assessment.questions.length)),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    const firstUnscored = [...assessment.questions]
      .sort((a, b) => a.questionNo - b.questionNo)
      .find((q) => q.rawScore === null);

    if (firstUnscored) {
      onSelectDim(firstUnscored.dimensionId);
      onHighlightQuestion(firstUnscored.questionId);
      requestAnimationFrame(() => {
        document.getElementById(`q-${firstUnscored.questionId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
      setTimeout(() => onHighlightQuestion(null), HIGHLIGHT_DURATION_MS);
      return;
    }

    const confirmed = await confirm({
      title: ASSESSMENT_FORM_TEXT.submitConfirmTitle(round),
      description: ASSESSMENT_FORM_TEXT.submitConfirmDescription,
      confirmLabel: ASSESSMENT_FORM_TEXT.submitConfirmLabel,
    });
    if (!confirmed) return;

    submitAssessment.mutate(undefined, {
      onSuccess: () =>
        alert({
          title: ASSESSMENT_FORM_TEXT.submitSuccessTitle,
          description: ASSESSMENT_FORM_TEXT.submitSuccess,
        }),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  // Last dimension's "save & next" has nowhere left to go, so it submits
  // instead — the dedicated Submit button was removed in favor of this.
  const handleSaveNext = () => {
    queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) });
    // dimensionCount 0 means the dimension list hasn't arrived — advance rather
    // than fall through to submit, which is not what this button offers yet.
    if (dimensionCount === 0 || selectedDim < dimensionCount) {
      onSelectDim(selectedDim + 1);
      requestAnimationFrame(() => {
        document
          .getElementById('assess-card')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      toast.success(ASSESSMENT_FORM_TEXT.savedNextDim(selectedDim + 1));
      return;
    }
    handleSubmit();
  };

  return {
    handleScoreChange,
    handleNoteChange,
    handleSuggestionChange,
    handleUploadEvidence,
    handleDeleteEvidence,
    handleSaveDraft,
    handleSubmit,
    handleSaveNext,
    isUploading: uploadEvidence.isPending,
    isSavingDraft: saveDraft.isPending,
    isSubmitting: submitAssessment.isPending,
  };
}
