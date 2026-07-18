'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/use-debounce';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useAssessmentHistory, useUpdateNotes } from '../hooks/use-assessment';
import { TIMELINE_TEXT } from '../constants/assessment-text.constants';
import { ROUND_LABELS } from '../types/assessment.types';
import type { Round } from '../types/assessment.types';

const ROUNDS: Round[] = ['T0', 'T1', 'T2', 'T3', 'T4'];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TimelineAreaProps {
  storeId: string;
  round: Round;
  assessmentId: string;
  notes: string | null;
  canEdit: boolean;
  className?: string;
}

export function TimelineArea({
  storeId,
  round,
  assessmentId,
  notes,
  canEdit,
  className,
}: TimelineAreaProps) {
  const { data: history } = useAssessmentHistory(storeId);
  const updateNotes = useUpdateNotes(storeId, round, assessmentId);

  const [notesValue, setNotesValue] = useState(notes ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const debouncedNotes = useDebounce(notesValue, 800);

  useEffect(() => {
    setNotesValue(notes ?? '');
  }, [notes]);

  useEffect(() => {
    if (!editingNotes) return;
    if (debouncedNotes === (notes ?? '')) return;
    updateNotes.mutate(debouncedNotes, {
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNotes]);

  const items = ROUNDS.filter((r) => r === round || history?.some((h) => h.round === r)).map(
    (r) => {
      const historyItem = history?.find((h) => h.round === r);
      const isCurrent = r === round;
      const isDone = historyItem?.status === 'SUBMITTED';
      return {
        round: r,
        title: isCurrent ? TIMELINE_TEXT.currentRound(r) : ROUND_LABELS[r],
        date: isDone ? (historyItem?.submittedAt ?? null) : (historyItem?.updatedAt ?? null),
        status: isCurrent ? 'current' : isDone ? 'done' : 'draft',
        assessorName: historyItem?.assessorName ?? null,
      } as const;
    }
  );

  return (
    <div className={cn('rounded-xl border bg-card p-5 shadow-sm', className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-bold text-charcoal">{TIMELINE_TEXT.title}</p>
        <p className="text-sm text-muted-foreground">{TIMELINE_TEXT.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-1 flex-wrap items-start gap-3">
          {items.map((item, i) => (
            <div key={item.round} className="flex items-center gap-3">
              <div
                className={cn(
                  'min-w-[170px] rounded-lg border-2 px-4 py-3',
                  item.status === 'current' && 'border-orange bg-cream',
                  item.status === 'done' && 'border-score-green bg-score-green/10',
                  item.status === 'draft' && 'border-border bg-muted/30'
                )}
              >
                <p className="text-sm font-bold text-charcoal">{item.title}</p>
                {item.date && (
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.date)}</p>
                )}
                {item.assessorName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {TIMELINE_TEXT.assessorByLabel(item.assessorName)}
                  </p>
                )}
                <span
                  className={cn(
                    'mt-2 inline-block rounded-full border px-2 py-1 text-xs font-semibold',
                    item.status === 'current' && 'border-orange text-orange',
                    item.status === 'done' && 'border-score-green text-score-green',
                    item.status === 'draft' && 'border-border text-muted-foreground'
                  )}
                >
                  {item.status === 'current'
                    ? TIMELINE_TEXT.statusCurrent
                    : item.status === 'done'
                      ? TIMELINE_TEXT.statusDone
                      : TIMELINE_TEXT.statusDraft}
                </span>
              </div>
              {i < items.length - 1 && <ArrowRight className="h-5 w-5 flex-shrink-0 text-border" />}
            </div>
          ))}
        </div>

        <div className="min-w-[260px] max-w-[340px] rounded-lg border-l-4 border-l-orange bg-muted/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-charcoal">{TIMELINE_TEXT.notesTitle}</p>
            {!editingNotes && canEdit && (
              <button
                type="button"
                onClick={() => setEditingNotes(true)}
                aria-label={TIMELINE_TEXT.editNotesAria}
                className="text-muted-foreground hover:text-orange"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                className="min-h-0 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setEditingNotes(false);
                  if (notesValue !== (notes ?? '')) {
                    updateNotes.mutate(notesValue, {
                      onError: (err) => toast.error(extractErrorMessage(err)),
                    });
                  }
                }}
              >
                {TIMELINE_TEXT.done}
              </Button>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {notesValue || TIMELINE_TEXT.emptyNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
