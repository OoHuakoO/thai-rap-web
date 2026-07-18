'use client';

import { Separator } from '@/components/ui/separator';
import { QuestionRow } from './question-row';
import { ASSESS_TABLE_TEXT } from '../constants/assessment-text.constants';
import { sumQuestionScores } from '../utils/dimension-score';
import type { AssessmentQuestion, Dimension } from '../types/assessment.types';

interface AssessTableProps {
  dimension: Dimension;
  questions: AssessmentQuestion[];
  locked: boolean;
  highlightedId: number | null;
  isUploading?: boolean;
  onScoreChange: (questionId: number, score: number) => void;
  onNoteChange: (questionId: number, note: string) => void;
  onSuggestionChange: (questionId: number, suggestion: string) => void;
  onUploadEvidence: (questionId: number, file: File) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

export function AssessTable({
  dimension,
  questions,
  locked,
  highlightedId,
  isUploading,
  onScoreChange,
  onNoteChange,
  onSuggestionChange,
  onUploadEvidence,
  onDeleteEvidence,
}: AssessTableProps) {
  const sorted = [...questions].sort((a, b) => a.questionNo - b.questionNo);
  const { sum, max } = sumQuestionScores(sorted);
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
          <span className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
            {ASSESS_TABLE_TEXT.weightBadge(dimension.weight)}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11.5px] text-muted-foreground">{ASSESS_TABLE_TEXT.rawScoreLabel}</span>
            <span className="text-lg font-extrabold text-orange">{sum}</span>
            <span className="text-xs font-normal text-muted-foreground">/ {max}</span>
            <span className="text-[11.5px] text-muted-foreground">({pct}%)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-[12.5px] text-muted-foreground">
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
                onSuggestionChange={(suggestion) => onSuggestionChange(q.questionId, suggestion)}
                onUploadEvidence={(file) => onUploadEvidence(q.questionId, file)}
                onDeleteEvidence={onDeleteEvidence}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-muted/20 px-4 py-2.5">
        <p className="text-[11.5px] text-muted-foreground">{ASSESS_TABLE_TEXT.totalRawLabel}</p>
        <p className="text-base font-extrabold text-orange">
          {sum}{' '}
          <span className="text-xs font-normal text-muted-foreground">
            {ASSESS_TABLE_TEXT.scoreOutOf(max, pct)}
          </span>
        </p>
      </div>
    </div>
  );
}
