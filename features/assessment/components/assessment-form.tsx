'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/shared/loading';
import { ProgressBar } from '@/components/shared/progress-bar';
import { useAlert, useConfirm } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useStore } from '@/features/store';
import { AssessmentStorePicker } from './assessment-store-picker';
import { RoundPills } from './round-pills';
import { DimensionList } from './dimension-list';
import { AssessTable } from './assess-table';
import { ScoreSummary } from './score-summary';
import { TimelineArea } from './timeline-area';
import {
  assessmentKeys,
  useAssessment,
  useDeleteEvidence,
  useDimensions,
  useSubmitAssessment,
  useUpdateScore,
  useUploadEvidence,
} from '../hooks/use-assessment';
import { ASSESSMENT_FORM_TEXT } from '../constants/assessment-text.constants';
import { TOTAL_QUESTIONS } from '../types/assessment.types';
import type { Round } from '../types/assessment.types';

interface AssessmentFormProps {
  storeId: string;
  round: Round;
}

export function AssessmentForm({ storeId, round }: AssessmentFormProps) {
  const queryClient = useQueryClient();
  const [isStoreCleared, setIsStoreCleared] = useState(false);
  const effectiveStoreId = isStoreCleared ? '' : storeId;
  const { data: store } = useStore(effectiveStoreId);
  const { data: assessment, isLoading, isError, error } = useAssessment(effectiveStoreId, round);
  const { data: dimensions } = useDimensions();
  const [selectedDim, setSelectedDim] = useState(1);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const confirm = useConfirm();
  const alert = useAlert();

  const updateScore = useUpdateScore(effectiveStoreId, round, assessment?.id ?? '');
  const submitAssessment = useSubmitAssessment(effectiveStoreId, round, assessment?.id ?? '');
  const uploadEvidence = useUploadEvidence(effectiveStoreId, round, assessment?.id ?? '');
  const deleteEvidence = useDeleteEvidence(effectiveStoreId, round, assessment?.id ?? '');

  if (isStoreCleared) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-3 shadow-sm">
          <AssessmentStorePicker
            storeId=""
            round={round}
            onProvinceChange={() => setIsStoreCleared(true)}
            onStoreSelect={() => setIsStoreCleared(false)}
          />
        </div>
        <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground shadow-sm">
          {ASSESSMENT_FORM_TEXT.noStoreSelectedMessage}
        </div>
      </div>
    );
  }

  if (isLoading) return <Loading className="py-16" />;

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>;
  }

  if (!assessment) return null;

  const locked = assessment.status === 'SUBMITTED';
  const scoredCount = assessment.questions.filter((q) => q.rawScore !== null).length;
  const progressPct = Math.round((scoredCount / TOTAL_QUESTIONS) * 100);
  const dimension = dimensions?.find((d) => d.id === selectedDim) ?? dimensions?.[0];
  const dimQuestions = assessment.questions.filter((q) => q.dimensionId === dimension?.id);

  const handleScoreChange = (questionId: number, score: number) => {
    const question = assessment.questions.find((q) => q.questionId === questionId);
    updateScore.mutate(
      {
        questionId,
        rawScore: score,
        note: question?.note ?? undefined,
        suggestion: question?.suggestion ?? undefined,
      },
      { onError: (err) => toast.error(extractErrorMessage(err)) }
    );
  };

  const handleNoteChange = (questionId: number, note: string) => {
    const question = assessment.questions.find((q) => q.questionId === questionId);
    if (question?.rawScore === null || question?.rawScore === undefined) return;
    updateScore.mutate(
      { questionId, rawScore: question.rawScore, note, suggestion: question.suggestion ?? undefined },
      { onError: (err) => toast.error(extractErrorMessage(err)) }
    );
  };

  const handleSuggestionChange = (questionId: number, suggestion: string) => {
    const question = assessment.questions.find((q) => q.questionId === questionId);
    if (question?.rawScore === null || question?.rawScore === undefined) return;
    updateScore.mutate(
      { questionId, rawScore: question.rawScore, note: question.note ?? undefined, suggestion },
      { onError: (err) => toast.error(extractErrorMessage(err)) }
    );
  };

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
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-3 shadow-sm">
        <AssessmentStorePicker
          storeId={storeId}
          storeName={store?.name}
          storeCoverUrl={store?.coverUrl}
          round={round}
          onProvinceChange={() => setIsStoreCleared(true)}
        />
        <div>
          <p className="mb-1 text-sm text-muted-foreground">
            {ASSESSMENT_FORM_TEXT.roundLabel}
          </p>
          <RoundPills storeId={storeId} activeRound={round} />
        </div>
        <div className="min-w-[160px] flex-1">
          <p className="mb-1 text-sm text-muted-foreground">
            {ASSESSMENT_FORM_TEXT.progressLabel}
          </p>
          <div className="flex items-center gap-2">
            <ProgressBar value={progressPct} className="flex-1" />
            <span className="text-sm font-bold text-orange">{progressPct}%</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="hover:bg-orange/10 gap-1.5 border-orange text-orange hover:text-orange"
            onClick={handleSaveDraft}
            disabled={locked}
          >
            {ASSESSMENT_FORM_TEXT.saveDraft}
          </Button>
          <Button onClick={handleSaveNext} disabled={locked || submitAssessment.isPending}>
            {ASSESSMENT_FORM_TEXT.saveNext}
          </Button>
        </div>
      </div>

      {dimensions && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
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
              locked={locked}
              highlightedId={highlightedId}
              isUploading={uploadEvidence.isPending}
              onScoreChange={handleScoreChange}
              onNoteChange={handleNoteChange}
              onSuggestionChange={handleSuggestionChange}
              onUploadEvidence={handleUploadEvidence}
              onDeleteEvidence={handleDeleteEvidence}
            />
          )}

          <ScoreSummary
            storeId={storeId}
            store={store}
            round={round}
            selectedDimId={selectedDim}
            totalScore={assessment.totalScore}
            questions={assessment.questions}
            redFlags={assessment.redFlags}
            isSubmitted={locked}
            className="lg:col-start-3 lg:row-start-1 lg:row-span-2"
          />

          <TimelineArea
            storeId={storeId}
            round={round}
            assessmentId={assessment.id}
            notes={assessment.notes}
            className="lg:col-start-1 lg:col-span-2 lg:row-start-2"
          />
        </div>
      )}
    </div>
  );
}
