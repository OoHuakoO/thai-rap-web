'use client';

import { ChevronRight } from 'lucide-react';
import { MaskIcon } from '@/components/shared/mask-icon';
import { cn } from '@/utils/cn';
import {
  DIMENSION_ICON_SRC,
  DIMENSION_LIST_TEXT,
  DIMENSION_TILE_CLASS,
  SCORE_LABELS,
} from '../constants/assessment-text.constants';
import { calcScorePercent, sumQuestionScores } from '../utils/dimension-score';
import type { AssessmentQuestion, Dimension } from '../types/assessment.types';

const SCORE_LEGEND = SCORE_LABELS.map((label, value) => ({ value, label }));

// The illustrated artwork (DIMENSION_ICON_SRC) is dense line art — it only
// reads clearly around 48px, so the tile is sized well above lucide's usual
// 16px inline icon to keep it legible.
interface DimensionListProps {
  dimensions: Dimension[];
  questions: AssessmentQuestion[];
  selectedId: number;
  totalScore: number | null;
  onSelect: (id: number) => void;
}

export function DimensionList({
  dimensions,
  questions,
  selectedId,
  totalScore,
  onSelect,
}: DimensionListProps) {
  return (
    // h-full fills the fixed 700px row (see assessment-form.tsx's
    // lg:h-[700px] wrapper) so this and AssessTable bottom out at the same
    // line — content scrolls internally instead of growing past that height.
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex-shrink-0 border-b px-3 py-2.5">
        <p className="text-sm font-bold text-charcoal">
          {DIMENSION_LIST_TEXT.title}{' '}
          <span className="ml-1 text-[11.5px] font-normal text-muted-foreground">
            {DIMENSION_LIST_TEXT.titleEn}
          </span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-2.5 my-2 rounded-lg bg-cream p-2">
          <p className="mb-1 text-[11.5px] font-bold text-orange">
            {DIMENSION_LIST_TEXT.scoreCriteria}
          </p>
          <div className="flex flex-wrap gap-1">
            {SCORE_LEGEND.map((s) => (
              <span
                key={s.value}
                className="flex items-center gap-1 rounded border bg-white px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
              >
                <b className="text-orange">{s.value}</b>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 px-2 pb-2">
          {dimensions.map((dim) => {
            const dimQuestions = questions.filter((q) => q.dimensionId === dim.id);
            const { sum, max } = sumQuestionScores(dimQuestions);
            const pct = calcScorePercent(sum, max);
            const active = dim.id === selectedId;
            const tileClassName = DIMENSION_TILE_CLASS[dim.id] ?? DIMENSION_TILE_CLASS[1];
            const iconSrc = DIMENSION_ICON_SRC[dim.id] ?? DIMENSION_ICON_SRC[1];

            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => onSelect(dim.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 text-left transition-colors hover:bg-cream',
                  active && 'border-orange/40 bg-orange/10'
                )}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white',
                    tileClassName
                  )}
                >
                  <MaskIcon src={iconSrc} className="h-9 w-9" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[12px] font-semibold leading-tight',
                      active ? 'text-orange' : 'text-charcoal'
                    )}
                  >
                    {dim.id}. {dim.name}
                  </span>
                  <span className="block text-[11.5px] leading-tight text-muted-foreground">
                    {dim.nameEn}
                  </span>
                </span>
                <span
                  className={cn(
                    'flex flex-shrink-0 items-center gap-0.5 text-[13px] font-bold',
                    active ? 'text-orange' : 'text-charcoal'
                  )}
                >
                  {pct}%{active && <ChevronRight className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t bg-muted/20 px-3 py-2.5">
        <div>
          <span className="block text-[11.5px] text-muted-foreground">
            {DIMENSION_LIST_TEXT.weightedScore}
          </span>
        </div>
        <span className="text-base font-extrabold text-orange">
          {(totalScore ?? 0).toFixed(2)}
          <span className="text-[11.5px] font-normal text-muted-foreground">/100</span>
        </span>
      </div>
    </div>
  );
}
