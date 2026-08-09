'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PITCHING_COMMENT_FIELDS, PITCHING_TEXT } from '../constants/pitching.constants';
import type { PitchingRound } from '../types/pitching.types';

interface PitchingCommentsProps {
  round: PitchingRound;
  comments: Record<string, string>;
  onCommit: (key: string, value: string) => void;
}

export function PitchingComments({ round, comments, onCommit }: PitchingCommentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{PITCHING_TEXT.commentsTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {PITCHING_COMMENT_FIELDS[round].map((field) => (
          <CommentField
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            value={comments[field.key] ?? ''}
            onCommit={onCommit}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface CommentFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  onCommit: (key: string, value: string) => void;
}

function CommentField({ fieldKey, label, value, onCommit }: CommentFieldProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`pitching-comment-${fieldKey}`}>{label}</Label>
      <Textarea
        id={`pitching-comment-${fieldKey}`}
        rows={3}
        value={draft}
        placeholder={PITCHING_TEXT.commentPlaceholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft === value) return;
          onCommit(fieldKey, draft);
        }}
      />
    </div>
  );
}
