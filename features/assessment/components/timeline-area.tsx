'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/use-debounce';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useAssessmentSummaries, useUpdateNotes } from '../hooks/use-assessment';
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
}

export function TimelineArea({ storeId, round, assessmentId, notes }: TimelineAreaProps) {
  const { data: summaries } = useAssessmentSummaries(storeId);
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

  const items = ROUNDS.filter((r) => r === round || summaries?.some((s) => s.round === r)).map(
    (r) => {
      const summary = summaries?.find((s) => s.round === r);
      const isCurrent = r === round;
      const isDone = summary?.status === 'SUBMITTED';
      return {
        round: r,
        title: isCurrent ? TIMELINE_TEXT.currentRound(r) : ROUND_LABELS[r],
        date: isDone ? (summary?.submittedAt ?? null) : (summary?.updatedAt ?? null),
        status: isCurrent ? 'current' : isDone ? 'done' : 'draft',
      } as const;
    }
  );

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-charcoal">{TIMELINE_TEXT.title}</p>
        <p className="text-[10px] text-muted-foreground">{TIMELINE_TEXT.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <div className="flex flex-1 flex-wrap items-start gap-2">
          {items.map((item, i) => (
            <div key={item.round} className="flex items-center gap-2">
              <div
                className={cn(
                  'min-w-[130px] rounded-lg border-[1.5px] px-2.5 py-2',
                  item.status === 'current' && 'border-orange bg-cream',
                  item.status === 'done' && 'bg-score-green/10 border-score-green',
                  item.status === 'draft' && 'border-border bg-muted/30'
                )}
              >
                <p className="text-[10.5px] font-bold text-charcoal">{item.title}</p>
                {item.date && (
                  <p className="mt-0.5 text-[9px] text-muted-foreground">{formatDate(item.date)}</p>
                )}
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-semibold',
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
              {i < items.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-border" />
              )}
            </div>
          ))}
        </div>

        <div className="min-w-[190px] max-w-[260px] rounded-lg border-l-[3px] border-l-orange bg-muted/30 p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10.5px] font-bold text-charcoal">{TIMELINE_TEXT.notesTitle}</p>
            {!editingNotes && (
              <button
                type="button"
                onClick={() => setEditingNotes(true)}
                className="text-muted-foreground hover:text-orange"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-1.5">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                className="min-h-0 text-xs"
                autoFocus
              />
              <Button size="sm" className="h-6 text-[10px]" onClick={() => setEditingNotes(false)}>
                {TIMELINE_TEXT.done}
              </Button>
            </div>
          ) : (
            <p className="text-[10.5px] leading-relaxed text-muted-foreground">
              {notesValue || TIMELINE_TEXT.emptyNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
