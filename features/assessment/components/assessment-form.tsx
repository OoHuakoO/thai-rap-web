'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/components/shared/loading';
import { ProgressBar } from '@/components/shared/progress-bar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useStore } from '@/features/store';
import { AssessmentFormHeader } from './assessment-form-header';
import { AssessmentNotice } from './assessment-notice';
import { DimensionList } from './dimension-list';
import { AssessTable } from './assess-table';
import { ScoreSummary } from './score-summary';
import { TimelineArea } from './timeline-area';
import { useAssessment, useAssessmentSummaries, useDimensions } from '../hooks/use-assessment';
import { useAssessmentFormActions } from '../hooks/use-assessment-form-actions';
import { ASSESSMENT_FORM_TEXT, ROUND_PILLS_TEXT } from '../constants/assessment-text.constants';
import { getMissingPriorRound } from '../utils/round';
import { isCompletedStatus } from '../utils/status';
import type { Round } from '../types/assessment.types';

interface AssessmentFormProps {
  storeId: string;
  round: Round;
}

export function AssessmentForm({ storeId, round }: AssessmentFormProps) {
  const can = useAuthStore((s) => s.can);
  const canWrite = can(PERMISSIONS.ASSESSMENT_WRITE);
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
    isMissing,
    retry,
  } = useAssessment(effectiveStoreId, round, {
    enabled: !isSummariesLoading && !missingPriorRound,
    canCreate: canWrite,
  });
  const { data: dimensions } = useDimensions();
  const [selectedDim, setSelectedDim] = useState(1);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const actions = useAssessmentFormActions({
    storeId: effectiveStoreId,
    round,
    assessment,
    dimensionCount: dimensions?.length ?? 0,
    selectedDim,
    onSelectDim: setSelectedDim,
    onHighlightQuestion: setHighlightedId,
  });

  const noticeProps = {
    storeId,
    storeName: store?.name,
    storeCoverUrl: store?.coverUrl,
    round,
    onProvinceChange: () => setIsStoreCleared(true),
  };

  if (isStoreCleared) {
    return (
      <AssessmentNotice
        {...noticeProps}
        storeId=""
        storeName={undefined}
        storeCoverUrl={undefined}
        onStoreSelect={() => setIsStoreCleared(false)}
      >
        <p className="text-sm text-muted-foreground">
          {ASSESSMENT_FORM_TEXT.noStoreSelectedMessage}
        </p>
      </AssessmentNotice>
    );
  }

  if (isSummariesLoading || isLoading) return <Loading className="py-16" />;

  if (missingPriorRound) {
    return (
      <AssessmentNotice {...noticeProps}>
        <p className="text-4xl">🔒</p>
        <p className="mt-2 text-base font-bold text-charcoal">
          {ROUND_PILLS_TEXT.lockTitle(missingPriorRound)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {ROUND_PILLS_TEXT.lockLine2Prefix} <b className="text-charcoal">{missingPriorRound}</b>{' '}
          {ROUND_PILLS_TEXT.lockLine2Suffix(round)}
        </p>
      </AssessmentNotice>
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

  // A read-only viewer landing on a round nobody has started yet: there is
  // nothing to show and creating it is not theirs to do.
  if (isMissing) {
    return (
      <AssessmentNotice {...noticeProps}>
        <p className="text-sm text-muted-foreground">
          {ASSESSMENT_FORM_TEXT.notStartedMessage(round)}
        </p>
      </AssessmentNotice>
    );
  }

  if (!assessment) return null;

  const locked = isCompletedStatus(assessment.status);
  // A MENTOR reaches this page on assessment:read but can't score — fold both
  // "already submitted" and "no write permission" into one read-only flag
  // consumed by the table/inputs below.
  const readOnly = locked || !canWrite;
  const scoredCount = assessment.questions.filter((q) => q.rawScore !== null).length;
  const progressPct = Math.round((scoredCount / assessment.questions.length) * 100);
  // Drives which of the two save modes the primary button offers: a complete
  // assessment can be submitted from any dimension, an incomplete one only
  // moves on to the next dimension.
  const isComplete = scoredCount === assessment.questions.length;
  const dimension = dimensions?.find((d) => d.id === selectedDim) ?? dimensions?.[0];
  const dimQuestions = assessment.questions.filter((q) => q.dimensionId === dimension?.id);

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
                onClick={actions.handleSaveDraft}
                disabled={locked || actions.isSavingDraft}
              >
                {ASSESSMENT_FORM_TEXT.saveDraft}
              </Button>
              <Button
                onClick={isComplete ? actions.handleSubmit : actions.handleSaveNext}
                disabled={locked || actions.isSubmitting}
              >
                {isComplete ? ASSESSMENT_FORM_TEXT.saveComplete : ASSESSMENT_FORM_TEXT.saveNext}
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
                // Falls back to the running score so the footer tracks scoring
                // instead of sitting at 0.00 until the round is submitted.
                totalScore={assessment.totalScore ?? assessment.currentScore}
                onSelect={setSelectedDim}
              />

              {dimension && (
                <AssessTable
                  dimension={dimension}
                  questions={dimQuestions}
                  locked={readOnly}
                  highlightedId={highlightedId}
                  isUploading={actions.isUploading}
                  onScoreChange={actions.handleScoreChange}
                  onNoteChange={actions.handleNoteChange}
                  onSuggestionChange={actions.handleSuggestionChange}
                  onUploadEvidence={actions.handleUploadEvidence}
                  onDeleteEvidence={actions.handleDeleteEvidence}
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
            currentScore={assessment.currentScore}
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
