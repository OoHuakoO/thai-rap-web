'use client';

import { cn } from '@/utils/cn';
import { SCORE_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import type { Round } from '../types/assessment.types';

interface ScoreSummaryRoundPickerProps {
  /** Rounds this store has an assessment for — the only ones with data to show. */
  rounds: Round[];
  value: Round;
  completedRounds: Round[];
  onChange: (round: Round) => void;
}

export function ScoreSummaryRoundPicker({
  rounds,
  value,
  completedRounds,
  onChange,
}: ScoreSummaryRoundPickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10.5px] text-muted-foreground">
        {SCORE_SUMMARY_TEXT.roundPickerLabel}
      </span>
      <div className="flex flex-wrap gap-1">
        {rounds.map((round) => {
          const isActive = round === value;
          // An unfinished round still has data worth looking at, it just isn't a
          // result yet — flag it rather than hiding it.
          const isCompleted = completedRounds.includes(round);
          return (
            <button
              key={round}
              type="button"
              onClick={() => onChange(round)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10.5px] font-bold transition-colors',
                isActive && 'border-orange bg-orange text-white',
                !isActive &&
                  isCompleted &&
                  'border-score-green/40 text-score-green hover:bg-score-green/10',
                !isActive &&
                  !isCompleted &&
                  'border-border text-muted-foreground hover:border-orange hover:text-orange'
              )}
            >
              {round}
            </button>
          );
        })}
      </div>
    </div>
  );
}
