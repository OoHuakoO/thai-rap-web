'use client';

import { cn } from '@/utils/cn';
import { SCORE_LABELS } from '../constants/assessment-text.constants';

const SCORE_ACTIVE_CLASS: Record<number, string> = {
  0: 'border-neutral-400 bg-neutral-100 text-neutral-600',
  1: 'border-red-500 bg-red-50 text-red-600',
  2: 'border-orange bg-orange/10 text-orange',
  3: 'border-score-green bg-score-green/10 text-score-green',
  4: 'border-blue-600 bg-blue-50 text-blue-700',
};

interface ScoreButtonGroupProps {
  value: number | null;
  /** Question.maxScore from the API — the schema allows it to vary per question. */
  maxScore: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function ScoreButtonGroup({ value, maxScore, disabled, onChange }: ScoreButtonGroupProps) {
  const options = Array.from({ length: maxScore + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-1">
        {options.map((v) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v)}
            title={SCORE_LABELS[v] ? `${v} - ${SCORE_LABELS[v]}` : String(v)}
            aria-pressed={value === v}
            className={cn(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-[1.5px] bg-muted/40 text-xs font-bold text-muted-foreground transition-all',
              'hover:border-orange hover:bg-orange/5 hover:text-orange',
              'disabled:pointer-events-none disabled:opacity-50',
              value === v && SCORE_ACTIVE_CLASS[v]
            )}
          >
            {v}
          </button>
        ))}
      </div>
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {value !== null ? (SCORE_LABELS[value] ?? value) : '—'}
      </span>
    </div>
  );
}
