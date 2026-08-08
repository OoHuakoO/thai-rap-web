'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';
import { PITCHING_SECTION_LABELS, PITCHING_TEXT } from '../constants/pitching.constants';
import type { PitchingCriterionScore } from '../types/pitching.types';

interface PitchingCriteriaTableProps {
  criteria: PitchingCriterionScore[];
  disabled: boolean;
  onScoreChange: (criterionId: number, score: number | null) => void;
  onNoteChange: (criterionId: number, note: string) => void;
}

export function PitchingCriteriaTable({
  criteria,
  disabled,
  onScoreChange,
  onNoteChange,
}: PitchingCriteriaTableProps) {
  const sections = groupBySection(criteria);

  return (
    <div className="space-y-4">
      {sections.map(({ section, rows }) => (
        <Card key={section ?? 'all'}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {section ? PITCHING_SECTION_LABELS[section] : PITCHING_TEXT.criteriaTitle}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {PITCHING_TEXT.maxScoreLabel(sumMax(rows))}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((criterion) => (
              <CriterionRow
                key={criterion.id}
                criterion={criterion}
                disabled={disabled}
                onScoreChange={onScoreChange}
                onNoteChange={onNoteChange}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface CriterionRowProps {
  criterion: PitchingCriterionScore;
  disabled: boolean;
  onScoreChange: (criterionId: number, score: number | null) => void;
  onNoteChange: (criterionId: number, note: string) => void;
}

function CriterionRow({ criterion, disabled, onScoreChange, onNoteChange }: CriterionRowProps) {
  // Local echo of the two fields so typing stays responsive while the mutation
  // is in flight; re-synced whenever the server's value for this row changes.
  const [score, setScore] = useState(criterion.score === null ? '' : String(criterion.score));
  const [note, setNote] = useState(criterion.note ?? '');

  useEffect(() => {
    setScore(criterion.score === null ? '' : String(criterion.score));
  }, [criterion.score]);
  useEffect(() => {
    setNote(criterion.note ?? '');
  }, [criterion.note]);

  const parsed = score === '' ? null : Number(score);
  const isOutOfRange = parsed !== null && (parsed < 0 || parsed > criterion.maxScore);
  const scoreId = `criterion-${criterion.id}-score`;
  const noteId = `criterion-${criterion.id}-note`;

  return (
    <div className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_9rem]">
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-main">
          <span className="mr-2 text-muted-foreground">{criterion.code}</span>
          {criterion.title}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{criterion.guideline}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={scoreId} className="text-xs">
          {PITCHING_TEXT.scoreLabel} ({PITCHING_TEXT.maxScoreLabel(criterion.maxScore)})
        </Label>
        <Input
          id={scoreId}
          type="number"
          inputMode="numeric"
          min={0}
          max={criterion.maxScore}
          value={score}
          disabled={disabled}
          className={cn(isOutOfRange && 'border-destructive')}
          onChange={(event) => setScore(event.target.value)}
          onBlur={() => {
            if (isOutOfRange) return;
            if (parsed === criterion.score) return;
            onScoreChange(criterion.id, parsed);
          }}
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor={noteId} className="text-xs">
          {PITCHING_TEXT.criterionNoteLabel}
        </Label>
        <Textarea
          id={noteId}
          rows={2}
          value={note}
          disabled={disabled}
          placeholder={PITCHING_TEXT.criterionNotePlaceholder}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => {
            if (note === (criterion.note ?? '')) return;
            onNoteChange(criterion.id, note);
          }}
        />
      </div>
    </div>
  );
}

function groupBySection(criteria: PitchingCriterionScore[]) {
  const sections: { section: string | null; rows: PitchingCriterionScore[] }[] = [];
  for (const criterion of criteria) {
    const last = sections[sections.length - 1];
    if (last && last.section === criterion.section) last.rows.push(criterion);
    else sections.push({ section: criterion.section, rows: [criterion] });
  }
  return sections;
}

function sumMax(rows: PitchingCriterionScore[]): number {
  return rows.reduce((total, row) => total + row.maxScore, 0);
}
