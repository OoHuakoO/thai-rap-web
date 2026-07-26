'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { RED_FLAG_LABELS, type RedFlag } from '@/features/assessment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ANALYTICS_ACCENT_CLASS } from '../constants/analytics-display.constants';
import { RED_FLAGS_CARD_TEXT } from '../constants/analytics-text.constants';
import { SEVERITY_BADGE_CLASS, SEVERITY_LABELS } from '../constants/red-flag-display.constants';

interface RedFlagsCardProps {
  redFlags: RedFlag[];
}

const accentClass = ANALYTICS_ACCENT_CLASS.red;

export function RedFlagsCard({ redFlags }: RedFlagsCardProps) {
  const [selected, setSelected] = useState<RedFlag | null>(null);

  return (
    <>
      <Card className="overflow-hidden shadow-sm">
        <CardHeader
          className={`flex flex-row items-center gap-2 space-y-0 py-2.5 ${accentClass.header}`}
        >
          <AlertTriangle className={`h-4 w-4 shrink-0 ${accentClass.text}`} />
          <CardTitle className={`text-[13px] font-semibold ${accentClass.text}`}>
            {RED_FLAGS_CARD_TEXT.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2.5">
          {redFlags.length === 0 ? (
            <p className="text-xs text-muted-foreground">{RED_FLAGS_CARD_TEXT.empty}</p>
          ) : (
            <ul className="space-y-1.5">
              {redFlags.map((flag) => (
                <li key={flag.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5 text-charcoal">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accentClass.dot}`} />
                    <span className="truncate">{RED_FLAG_LABELS[flag.type]}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(flag)}
                    className={`shrink-0 font-medium underline-offset-2 hover:underline ${accentClass.text}`}
                  >
                    {RED_FLAGS_CARD_TEXT.detailLink}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{RED_FLAGS_CARD_TEXT.dialogTitle}</DialogTitle>
            <DialogDescription>{selected ? RED_FLAG_LABELS[selected.type] : ''}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {RED_FLAGS_CARD_TEXT.severityLabel}
                </span>
                <Badge variant="outline" className={SEVERITY_BADGE_CLASS[selected.severity]}>
                  {SEVERITY_LABELS[selected.severity]}
                </Badge>
                {selected.resolved && (
                  <Badge
                    variant="outline"
                    className="border-score-green/20 bg-score-green/10 text-score-green"
                  >
                    {RED_FLAGS_CARD_TEXT.resolved}
                  </Badge>
                )}
              </div>

              {selected.triggerQuestions.length > 0 && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {RED_FLAGS_CARD_TEXT.triggerQuestionsLabel}
                  </p>
                  <p className="tabular-nums text-charcoal">
                    {selected.triggerQuestions.join(', ')}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {RED_FLAGS_CARD_TEXT.recommendationLabel}
                </p>
                <p className="leading-relaxed text-charcoal">
                  {selected.recommendation ?? RED_FLAGS_CARD_TEXT.noRecommendation}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              {RED_FLAGS_CARD_TEXT.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
