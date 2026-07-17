'use client';

import { ChefHat, ClipboardList, Landmark, Leaf, Rocket, TrendingUp, UserPlus, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DIMENSION_LIST_TEXT, SCORE_LABELS } from '../constants/assessment-text.constants';
import type { AssessmentQuestion, Dimension } from '../types/assessment.types';

const SCORE_LEGEND = SCORE_LABELS.map((label, value) => ({ value, label }));

const DIMENSION_ICON: Record<number, { icon: typeof ChefHat; className: string }> = {
  1: { icon: ChefHat, className: 'bg-violet-600' },
  2: { icon: ClipboardList, className: 'bg-orange' },
  3: { icon: TrendingUp, className: 'bg-emerald-600' },
  4: { icon: Landmark, className: 'bg-blue-700' },
  5: { icon: Users, className: 'bg-amber-500' },
  6: { icon: UserPlus, className: 'bg-purple-600' },
  7: { icon: Rocket, className: 'bg-teal-600' },
  8: { icon: Leaf, className: 'bg-green-600' },
};

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
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-3 py-2.5">
        <p className="text-sm font-bold text-charcoal">
          {DIMENSION_LIST_TEXT.title}{' '}
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">
            {DIMENSION_LIST_TEXT.titleEn}
          </span>
        </p>
      </div>

      <div className="mx-2.5 my-2 rounded-lg bg-cream p-2">
        <p className="mb-1 text-[10px] font-bold text-orange">
          {DIMENSION_LIST_TEXT.scoreCriteria}
        </p>
        <div className="flex flex-wrap gap-1">
          {SCORE_LEGEND.map((s) => (
            <span
              key={s.value}
              className="flex items-center gap-1 rounded border bg-white px-1.5 py-0.5 text-[9px] text-muted-foreground"
            >
              <b className="text-orange">{s.value}</b>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        {dimensions.map((dim) => {
          const dimQuestions = questions.filter((q) => q.dimensionId === dim.id);
          const max = dimQuestions.length * 4;
          const sum = dimQuestions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0);
          const pct = max === 0 ? 0 : Math.round((sum / max) * 100);
          const active = dim.id === selectedId;
          const { icon: Icon, className: iconClassName } = DIMENSION_ICON[dim.id] ?? DIMENSION_ICON[1];

          return (
            <button
              key={dim.id}
              type="button"
              onClick={() => onSelect(dim.id)}
              className={cn(
                'flex w-full items-center gap-2.5 border-b px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-cream',
                active && 'bg-orange/10'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white',
                  iconClassName
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold leading-tight text-charcoal">
                  {dim.id}. {dim.name}
                </span>
                <span className="block truncate text-[9px] leading-tight text-muted-foreground">
                  {dim.nameEn}
                </span>
              </span>
              <span className="flex-shrink-0 text-[13px] font-bold text-charcoal">{pct}%</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-2.5">
        <div>
          <span className="block text-[10px] text-muted-foreground">
            {DIMENSION_LIST_TEXT.weightedScore}
          </span>
          <span className="cursor-default text-[9px] text-orange underline">
            {DIMENSION_LIST_TEXT.viewAll}
          </span>
        </div>
        <span className="text-base font-extrabold text-orange">
          {(totalScore ?? 0).toFixed(2)}
          <span className="text-[10px] font-normal text-muted-foreground">/100</span>
        </span>
      </div>
    </div>
  );
}
