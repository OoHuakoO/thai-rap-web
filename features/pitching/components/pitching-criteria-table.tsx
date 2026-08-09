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
  onScoreChange: (criterionId: number, score: number | null) => void;
  onNoteChange: (criterionId: number, note: string) => void;
}

export function PitchingCriteriaTable({
  criteria,
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
  onScoreChange: (criterionId: number, score: number | null) => void;
  onNoteChange: (criterionId: number, note: string) => void;
}

function CriterionRow({ criterion, onScoreChange, onNoteChange }: CriterionRowProps) {
  // Local echo of the two fields so typing stays responsive while the mutation
  // is in flight; re-synced whenever the server's value for this row changes.
  const [score, setScore] = useState(criterion.score === null ? '' : String(criterion.score));
  const [note, setNote] = useState(criterion.note ?? '');
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    setScore(criterion.score === null ? '' : String(criterion.score));
  }, [criterion.score]);
  useEffect(() => {
    setNote(criterion.note ?? '');
  }, [criterion.note]);

  const scoreId = `criterion-${criterion.id}-score`;
  const scoreErrorId = `criterion-${criterion.id}-score-error`;
  const noteId = `criterion-${criterion.id}-note`;

  // `max` on a number input only blocks the spinner, not typing or pasting, so
  // the bound is enforced here: a value outside 0..maxScore (or a fraction, which
  // the API rejects as a non-integer) is refused and the last accepted one stays
  // in the box. The draft therefore never holds a score the API would 400 on.
  const handleScoreChange = (raw: string) => {
    if (raw === '') {
      setIsRejected(false);
      setScore('');
      if (criterion.score !== null) onScoreChange(criterion.id, null);
      return;
    }

    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > criterion.maxScore) {
      setIsRejected(true);
      return;
    }

    setIsRejected(false);
    setScore(raw);
    if (parsed !== criterion.score) onScoreChange(criterion.id, parsed);
  };

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
          step={1}
          min={0}
          max={criterion.maxScore}
          value={score}
          aria-invalid={isRejected}
          aria-describedby={isRejected ? scoreErrorId : undefined}
          className={cn(isRejected && 'border-destructive')}
          onChange={(event) => handleScoreChange(event.target.value)}
          onBlur={() => setIsRejected(false)}
        />
        {isRejected && (
          <p id={scoreErrorId} className="text-xs text-destructive">
            {PITCHING_TEXT.scoreOutOfRange(criterion.maxScore)}
          </p>
        )}
      </div>

      {/* Only the acceleration form has a หลักฐาน/ข้อสังเกต column beside each
          criterion; the pitch deck form scores the row and nothing else. */}
      {criterion.round === 'ACCELERATION' && (
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={noteId} className="text-xs">
            {PITCHING_TEXT.criterionNoteLabel}
          </Label>
          <Textarea
            id={noteId}
            rows={2}
            value={note}
            placeholder={PITCHING_TEXT.criterionNotePlaceholder}
            onChange={(event) => setNote(event.target.value)}
            onBlur={() => {
              if (note === (criterion.note ?? '')) return;
              onNoteChange(criterion.id, note);
            }}
          />
        </div>
      )}
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
