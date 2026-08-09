'use client';

import { ListChecks } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { ProgressBar } from '@/components/shared/progress-bar';
import { PITCHING_DASHBOARD_TEXT, PITCHING_TEXT } from '../constants/pitching.constants';
import { PitchingPanel } from './pitching-panel';

export interface PitchingScoreRow {
  id: number;
  code: string;
  title: string;
  maxScore: number;
  /** Null while a judge has left the criterion unscored. */
  score: number | null;
}

interface PitchingScoreBreakdownProps {
  rows: PitchingScoreRow[];
  /** Σ of the rows — the cross-judge average, or one judge's own total. */
  total: number | null;
  /** "คะแนนเฉลี่ย" for the cross-judge view, "คะแนนที่ให้" for a single judge. */
  scoreColumnLabel: string;
}

export function PitchingScoreBreakdown({
  rows,
  total,
  scoreColumnLabel,
}: PitchingScoreBreakdownProps) {
  return (
    <PitchingPanel title={PITCHING_DASHBOARD_TEXT.criteriaTitle} icon={ListChecks} accent="orange">
      {rows.length === 0 ? (
        <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.criteriaEmpty} />
      ) : (
        <>
          <div className="flex items-center gap-3 border-b pb-2 text-xs text-muted-foreground">
            <span className="w-8 flex-shrink-0">{PITCHING_DASHBOARD_TEXT.judgeIndexColumn}</span>
            <span className="min-w-0 flex-1">{PITCHING_TEXT.criteriaTitle}</span>
            <span className="w-32 flex-shrink-0 text-right">{scoreColumnLabel}</span>
          </div>

          {/* The rows carry the panel's height: the total strip below is pushed
              to the bottom edge so this card ends level with the one beside it
              instead of leaving a gap under the last criterion. */}
          <ul className="flex-1 space-y-1">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-md px-1.5 py-1.5 transition-colors hover:bg-muted/40"
              >
                <span className="w-8 flex-shrink-0 text-sm text-muted-foreground">{row.code}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-text-main" title={row.title}>
                  {row.title}
                </span>
                <span className="w-32 flex-shrink-0">
                  <ProgressBar value={row.score === null ? 0 : (row.score / row.maxScore) * 100} />
                </span>
                <span className="w-20 flex-shrink-0 text-right text-sm font-medium tabular-nums">
                  {row.score ?? PITCHING_TEXT.noComment}
                  <span className="text-muted-foreground"> / {row.maxScore}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-1 flex items-center justify-between rounded-xl border border-orange/20 bg-gradient-to-r from-cream to-cream-light px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text-main">
                {PITCHING_DASHBOARD_TEXT.totalLabel}
              </p>
              <p className="text-xs text-muted-foreground">{PITCHING_DASHBOARD_TEXT.totalHint}</p>
            </div>
            <p className="text-3xl font-bold tabular-nums text-orange">
              {PITCHING_TEXT.totalOutOf(total ?? 0)}
            </p>
          </div>
        </>
      )}
    </PitchingPanel>
  );
}
