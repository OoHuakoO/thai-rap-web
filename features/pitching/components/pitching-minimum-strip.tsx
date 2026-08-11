import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PITCHING_TEXT } from '../constants/pitching.constants';
import type { PitchingMinimumConditions } from '../types/pitching.types';

interface PitchingMinimumConditionsStripProps {
  conditions: PitchingMinimumConditions;
  className?: string;
}

/**
 * Read-only counterpart to `PitchingMinimumConditionsPanel` — the same gate the
 * judge fills in on the form, printed with both raw figures. A total can clear
 * 60 and still fail here, so the two numbers travel with the verdict wherever
 * the verdict is shown.
 */
export function PitchingMinimumConditionsStrip({
  conditions,
  className,
}: PitchingMinimumConditionsStripProps) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-xs',
        conditions.passed
          ? 'border-score-green/25 bg-score-green/[0.06] text-score-green'
          : 'border-score-red/25 bg-score-red/[0.06] text-score-red',
        className
      )}
    >
      {conditions.passed ? (
        <CircleCheck className="h-4 w-4 flex-shrink-0" />
      ) : (
        <CircleAlert className="h-4 w-4 flex-shrink-0" />
      )}
      <span className="font-semibold">
        {conditions.passed ? PITCHING_TEXT.minimumPassed : PITCHING_TEXT.minimumFailed}
      </span>
      <span className="text-charcoal">
        {PITCHING_TEXT.scoreCardLabel}: {conditions.scoreCardTotal ?? '—'}
        {' · '}
        {PITCHING_TEXT.participationLabel}: {conditions.participationPct ?? '—'}
      </span>
    </p>
  );
}
