'use client';

import { Button } from '@/components/ui/button';
import { SUBMIT_BAR_TEXT } from '../constants/assessment-text.constants';
import { TOTAL_QUESTIONS } from '../types/assessment.types';

interface SubmitBarProps {
  scored: number;
  isSubmitted: boolean;
  isPending: boolean;
  onSubmit: () => void;
}

export function SubmitBar({ scored, isSubmitted, isPending, onSubmit }: SubmitBarProps) {
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <span className="rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-bold text-green-700">
          {SUBMIT_BAR_TEXT.submittedLocked}
        </span>
      </div>
    );
  }

  const remaining = TOTAL_QUESTIONS - scored;

  return (
    <div className="flex items-center justify-end gap-3 border-t pt-4">
      {remaining > 0 ? (
        <span className="text-sm text-muted-foreground">
          {SUBMIT_BAR_TEXT.remainingPrefix} <b className="text-charcoal">{remaining}</b>{' '}
          {SUBMIT_BAR_TEXT.remainingSuffix}
        </span>
      ) : (
        <span className="text-sm font-medium text-score-green">{SUBMIT_BAR_TEXT.allDone}</span>
      )}
      <Button onClick={onSubmit} disabled={isPending}>
        {isPending
          ? SUBMIT_BAR_TEXT.submitting
          : remaining > 0
            ? SUBMIT_BAR_TEXT.submitSkip
            : SUBMIT_BAR_TEXT.submit}
      </Button>
    </div>
  );
}
