'use client';

import { Button } from '@/components/ui/button';
import { QuestionRow } from './question-row';
import { ASSESS_TABLE_TEXT } from '../constants/assessment-text.constants';
import type { AssessmentQuestion, Dimension } from '../types/assessment.types';

interface AssessTableProps {
  dimension: Dimension;
  questions: AssessmentQuestion[];
  locked: boolean;
  highlightedId: number | null;
  isUploading?: boolean;
  onScoreChange: (questionId: number, score: number) => void;
  onNoteChange: (questionId: number, note: string) => void;
  onUploadEvidence: (questionId: number, file: File) => void;
  onDeleteEvidence: (evidenceId: string) => void;
  onSaveDraft: () => void;
  onSaveNext: () => void;
}

export function AssessTable({
  dimension,
  questions,
  locked,
  highlightedId,
  isUploading,
  onScoreChange,
  onNoteChange,
  onUploadEvidence,
  onDeleteEvidence,
  onSaveDraft,
  onSaveNext,
}: AssessTableProps) {
  const sorted = [...questions].sort((a, b) => a.questionNo - b.questionNo);
  const max = sorted.length * 4;
  const sum = sorted.reduce((acc, q) => acc + (q.rawScore ?? 0), 0);
  const pct = max === 0 ? 0 : Math.round((sum / max) * 100);
  const firstNo = sorted[0]?.questionNo;
  const lastNo = sorted[sorted.length - 1]?.questionNo;
  const rangeText = firstNo && lastNo ? ASSESS_TABLE_TEXT.questionRange(firstNo, lastNo) : '';

  return (
    <div id="assess-card" className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange to-orange-light text-lg">
            🍽
          </span>
          <div>
            <p className="text-sm font-bold text-charcoal">
              {ASSESS_TABLE_TEXT.dimensionTitle(dimension.id, dimension.name)}{' '}
              <span className="font-normal text-muted-foreground">/ {dimension.nameEn}</span>
            </p>
            <p className="mt-0.5 max-w-[420px] text-xs text-muted-foreground">
              {ASSESS_TABLE_TEXT.dimensionMeta(sorted.length, rangeText, dimension.weight, max)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground">
            {ASSESS_TABLE_TEXT.weightBadge(dimension.weight)}
          </span>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{ASSESS_TABLE_TEXT.rawScoreLabel}</p>
            <p className="text-lg font-extrabold text-orange">
              {sum}
              <span className="text-xs font-normal text-muted-foreground"> / {max}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">({pct}%)</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-[11px] text-muted-foreground">
              <th className="px-2 py-2 text-left font-semibold">{ASSESS_TABLE_TEXT.columnNo}</th>
              <th className="px-2 py-2 text-left font-semibold">
                {ASSESS_TABLE_TEXT.columnCriteria}
              </th>
              <th className="px-2 py-2 text-left font-semibold">{ASSESS_TABLE_TEXT.columnScore}</th>
              <th className="px-2 py-2 text-left font-semibold">
                {ASSESS_TABLE_TEXT.columnEvidence}
              </th>
              <th className="px-2 py-2 text-left font-semibold">{ASSESS_TABLE_TEXT.columnNote}</th>
              <th className="px-2 py-2 text-left font-semibold">
                {ASSESS_TABLE_TEXT.columnSuggestion}
              </th>
              <th className="px-2 py-2 text-left font-semibold">
                {ASSESS_TABLE_TEXT.columnStatus}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((q) => (
              <QuestionRow
                key={q.questionId}
                question={q}
                locked={locked}
                highlighted={highlightedId === q.questionId}
                isUploading={isUploading}
                onScoreChange={(score) => onScoreChange(q.questionId, score)}
                onNoteChange={(note) => onNoteChange(q.questionId, note)}
                onUploadEvidence={(file) => onUploadEvidence(q.questionId, file)}
                onDeleteEvidence={onDeleteEvidence}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-4 py-2.5">
        <div>
          <p className="text-[10px] text-muted-foreground">{ASSESS_TABLE_TEXT.totalRawLabel}</p>
          <p className="text-base font-extrabold text-orange">
            {sum}{' '}
            <span className="text-xs font-normal text-muted-foreground">
              {ASSESS_TABLE_TEXT.scoreOutOf(max, pct)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-orange/10 gap-1.5 border-orange text-orange hover:text-orange"
            onClick={onSaveDraft}
            disabled={locked}
          >
            {ASSESS_TABLE_TEXT.saveDraft}
          </Button>
          <Button size="sm" onClick={onSaveNext} disabled={locked}>
            {ASSESS_TABLE_TEXT.saveNext}
          </Button>
        </div>
      </div>
    </div>
  );
}
