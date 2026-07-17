'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAssessmentSummaries } from '../hooks/use-assessment';
import { ROUND_PILLS_TEXT } from '../constants/assessment-text.constants';
import type { Round } from '../types/assessment.types';

const ROUNDS: Round[] = ['T0', 'T1', 'T2', 'T3', 'T4'];
const LOCKED_UNTIL_T1: Round[] = ['T2', 'T3', 'T4'];

interface RoundPillsProps {
  storeId: string;
  activeRound?: Round;
}

export function RoundPills({ storeId, activeRound }: RoundPillsProps) {
  const router = useRouter();
  const { data: summaries } = useAssessmentSummaries(storeId);
  const [lockOpen, setLockOpen] = useState(false);

  // Mirrors ROUNDS_LOCKED_UNTIL_T1 in the API's AssessmentService — the API
  // accepts SUBMITTED or APPROVED, so the UI lock must too.
  const t1Status = summaries?.find((s) => s.round === 'T1')?.status;
  const t1Submitted = t1Status === 'SUBMITTED' || t1Status === 'APPROVED';

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {ROUNDS.map((round) => {
          const summary = summaries?.find((s) => s.round === round);
          const isSubmitted = summary?.status === 'SUBMITTED';
          const isActive = round === activeRound;
          const isLocked = LOCKED_UNTIL_T1.includes(round) && !t1Submitted;

          return (
            <button
              key={round}
              type="button"
              onClick={() => {
                if (isLocked) {
                  setLockOpen(true);
                  return;
                }
                router.push(ROUTES.ASSESSMENT_DETAIL(storeId, round));
              }}
              className={cn(
                'relative rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-bold transition-all',
                isLocked && 'cursor-not-allowed border-border text-muted-foreground/50',
                !isLocked &&
                  isActive &&
                  'border-purple-banner bg-purple-banner text-white',
                !isLocked && !isActive && isSubmitted && 'border-score-green text-score-green',
                !isLocked &&
                  !isActive &&
                  !isSubmitted &&
                  'border-border text-muted-foreground hover:border-orange hover:text-orange'
              )}
            >
              {round}
              {isLocked && (
                <Lock className="ml-1 inline-block h-2.5 w-2.5 -translate-y-px" strokeWidth={3} />
              )}
              {isSubmitted && !isActive && !isLocked && (
                <span className="absolute -right-1 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-score-green text-white">
                  <Check className="h-2 w-2" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <span className="text-4xl">🔒</span>
            <DialogTitle>{ROUND_PILLS_TEXT.lockTitle}</DialogTitle>
            <DialogDescription>
              {ROUND_PILLS_TEXT.lockLine1}
              <br />
              {ROUND_PILLS_TEXT.lockLine2Prefix} <b className="text-charcoal">T1</b>{' '}
              {ROUND_PILLS_TEXT.lockLine2Suffix}
              <br />
              {ROUND_PILLS_TEXT.lockLine3}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setLockOpen(false)}>{ROUND_PILLS_TEXT.lockConfirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
