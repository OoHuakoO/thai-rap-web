'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/shared/loading';
import { ProgressBar } from '@/components/shared/progress-bar';
import { useAlert, useConfirm } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useStore } from '@/features/store';
import { AssessmentFormHeader } from './assessment-form-header';
import { DimensionList } from './dimension-list';
import { AssessTable } from './assess-table';
import { ScoreSummary } from './score-summary';
import { TimelineArea } from './timeline-area';
import {
  assessmentKeys,
  useAssessment,
  useAssessmentSummaries,
  useDeleteEvidence,
  useDimensions,
  useSubmitAssessment,
  useUpdateScore,
  useUploadEvidence,
} from '../hooks/use-assessment';
import { ASSESSMENT_FORM_TEXT, ROUND_PILLS_TEXT } from '../constants/assessment-text.constants';
import { getMissingPriorRound } from '../utils/round';
import type { Round, UpdateScoreDto } from '../types/assessment.types';

interface AssessmentFormProps {
  storeId: string;
  round: Round;
}

export function AssessmentForm({ storeId, round }: AssessmentFormProps) {
  const queryClient = useQueryClient();
  const [isStoreCleared, setIsStoreCleared] = useState(false);

  // storeId can change from outside the picker (browser back/forward, a
  // direct link) — without this, a stale isStoreCleared=true left over from
  // a prior province-change would keep showing the empty picker state
  // forever instead of loading the new store.
  useEffect(() => {
    setIsStoreCleared(false);
  }, [storeId]);

  const effectiveStoreId = isStoreCleared ? '' : storeId;
  const { data: store } = useStore(effectiveStoreId);
  const { data: summaries, isLoading: isSummariesLoading } =
    useAssessmentSummaries(effectiveStoreId);
  // Unknown while summaries are still loading, so we don't flash the locked
  // notice for a round that turns out to be unlocked once summaries arrive.
  const missingPriorRound = isSummariesLoading ? null : getMissingPriorRound(summaries, round);
  const {
    data: assessment,
    isLoading,
    isError,
    error,
    retry,
  } = useAssessment(effectiveStoreId, round, {
    enabled: !isSummariesLoading && !missingPriorRound,
  });
  const { data: dimensions } = useDimensions();
  const [selectedDim, setSelectedDim] = useState(1);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const confirm = useConfirm();
  const alert = useAlert();
  const can = useAuthStore((s) => s.can);

  const updateScore = useUpdateScore(effectiveStoreId, round, assessment?.id ?? '');
  const submitAssessment = useSubmitAssessment(effectiveStoreId, round, assessment?.id ?? '');
  const uploadEvidence = useUploadEvidence(effectiveStoreId, round, assessment?.id ?? '');
  const deleteEvidence = useDeleteEvidence(effectiveStoreId, round, assessment?.id ?? '');

  if (isStoreCleared) {
    return (
      <div className="space-y-4">
        <AssessmentFormHeader
          storeId=""
          round={round}
          onProvinceChange={() => setIsStoreCleared(true)}
          onStoreSelect={() => setIsStoreCleared(false)}
        />
        <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground shadow-sm">
          {ASSESSMENT_FORM_TEXT.noStoreSelectedMessage}
        </div>
      </div>
    );
  }

  if (isSummariesLoading || isLoading) return <Loading className="py-16" />;

  if (missingPriorRound) {
    return (
      <div className="space-y-4">
        <AssessmentFormHeader
          storeId={storeId}
          storeName={store?.name}
          storeCoverUrl={store?.coverUrl}
          round={round}
          onProvinceChange={() => setIsStoreCleared(true)}
        />
        <div className="rounded-xl border bg-card py-16 text-center shadow-sm">
          <p className="text-4xl">🔒</p>
          <p className="mt-2 text-base font-bold text-charcoal">
            {ROUND_PILLS_TEXT.lockTitle(missingPriorRound)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {ROUND_PILLS_TEXT.lockLine2Prefix} <b className="text-charcoal">{missingPriorRound}</b>{' '}
            {ROUND_PILLS_TEXT.lockLine2Suffix(round)}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-destructive">{extractErrorMessage(error)}</p>
        <Button variant="outline" onClick={retry}>
          {ASSESSMENT_FORM_TEXT.retry}
        </Button>
      </div>
    );
  }

  if (!assessment) return null;

  const canWrite = can(PERMISSIONS.ASSESSMENT_WRITE);
  const locked = assessment.status === 'SUBMITTED';
  // Mentors/entrepreneurs can reach this page (assessment:read) but can't
  // score — fold both "already submitted" and "no write permission" into
  // one read-only flag consumed by the table/inputs below.
  const readOnly = locked || !canWrite;
  const scoredCount = assessment.questions.filter((q) => q.rawScore !== null).length;
  const progressPct = Math.round((scoredCount / assessment.questions.length) * 100);
  const dimension = dimensions?.find((d) => d.id === selectedDim) ?? dimensions?.[0];
  const dimQuestions = assessment.questions.filter((q) => q.dimensionId === dimension?.id);

  // Shared by score/note/suggestion changes: find the question, fall back to
  // its existing fields for whatever the caller didn't change, and skip the
  // write if there's no score yet (note/suggestion inputs are disabled in
  // that state, but this guard covers the call site too).
  const saveScore = (
    questionId: number,
    patch: Partial<Pick<UpdateScoreDto, 'rawScore' | 'note' | 'suggestion'>>
  ) => {
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

  const handleSaveDraft = () => {
    queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) });
    toast.success(ASSESSMENT_FORM_TEXT.draftSaved);
  };

  const maxDim = dimensions?.length ?? 8;

  const handleSubmit = async () => {
    const firstUnscored = [...assessment.questions]
      .sort((a, b) => a.questionNo - b.questionNo)
      .find((q) => q.rawScore === null);

    if (firstUnscored) {
      setSelectedDim(firstUnscored.dimensionId);
      setHighlightedId(firstUnscored.questionId);
      requestAnimationFrame(() => {
        document.getElementById(`q-${firstUnscored.questionId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
      setTimeout(() => setHighlightedId(null), 2500);
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
    if (selectedDim < maxDim) {
      setSelectedDim(selectedDim + 1);
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

  return (
    <div className="space-y-4">
      <AssessmentFormHeader
        storeId={storeId}
        storeName={store?.name}
        storeCoverUrl={store?.coverUrl}
        round={round}
        onProvinceChange={() => setIsStoreCleared(true)}
      >
        <div className="min-w-[160px] flex-1">
          <p className="mb-1 text-sm text-muted-foreground">{ASSESSMENT_FORM_TEXT.progressLabel}</p>
          <div className="flex items-center gap-2">
            <ProgressBar value={progressPct} className="flex-1" />
            <span className="text-sm font-bold text-orange">{progressPct}%</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {canWrite && (
            <>
              <Button
                variant="outline"
                className="gap-1.5 border-orange text-orange hover:bg-orange/10 hover:text-orange"
                onClick={handleSaveDraft}
                disabled={locked}
              >
                {ASSESSMENT_FORM_TEXT.saveDraft}
              </Button>
              <Button onClick={handleSaveNext} disabled={locked || submitAssessment.isPending}>
                {ASSESSMENT_FORM_TEXT.saveNext}
              </Button>
            </>
          )}
        </div>
      </AssessmentFormHeader>

      {dimensions && (
        // Left column (fixed-height dim/table row + natural-height
        // TimelineArea right under it, flush, no gap) is normal flow and is
        // what sizes this container. ScoreSummary is pinned absolute
        // (inset-y-0) instead of living in the flow, so it takes its height
        // from the container — i.e. from the left column — rather than the
        // other way around, and scrolls internally if its own content (8
        // dimension scores + chart) runs longer than that. That's the only
        // way to keep TimelineArea's bottom edge flush with ScoreSummary's
        // bottom edge AND keep TimelineArea sitting flush under dim/table at
        // the same time: those two things can only both be true if
        // ScoreSummary's height is derived from the left column, since
        // dim/table (fixed) + TimelineArea (natural) is a fixed sum that
        // won't ever coincidentally match ScoreSummary's own content height.
        // pr-[352px] reserves ScoreSummary's 340px width + the 12px (gap-3)
        // gutter beside it.
        <div className="relative lg:pr-[352px]">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 lg:h-[700px] lg:grid-cols-[280px_minmax(0,1fr)]">
              <DimensionList
                dimensions={dimensions}
                questions={assessment.questions}
                selectedId={selectedDim}
                totalScore={assessment.totalScore}
                onSelect={setSelectedDim}
              />

              {dimension && (
                <AssessTable
                  dimension={dimension}
                  questions={dimQuestions}
                  locked={readOnly}
                  highlightedId={highlightedId}
                  isUploading={uploadEvidence.isPending}
                  onScoreChange={handleScoreChange}
                  onNoteChange={handleNoteChange}
                  onSuggestionChange={handleSuggestionChange}
                  onUploadEvidence={handleUploadEvidence}
                  onDeleteEvidence={handleDeleteEvidence}
                />
              )}
            </div>

            <TimelineArea
              storeId={storeId}
              round={round}
              assessmentId={assessment.id}
              notes={assessment.notes}
              canEdit={canWrite}
            />
          </div>

          <ScoreSummary
            storeId={storeId}
            store={store}
            round={round}
            selectedDimId={selectedDim}
            totalScore={assessment.totalScore}
            questions={assessment.questions}
            redFlags={assessment.redFlags}
            isSubmitted={locked}
            className="mt-3 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[340px]"
          />
        </div>
      )}
    </div>
  );
}
