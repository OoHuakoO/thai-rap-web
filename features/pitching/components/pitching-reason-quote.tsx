import { MessageSquareQuote } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PITCHING_TEXT } from '../constants/pitching.constants';

export type PitchingReasonQuoteAccent = 'charcoal' | 'purple';

// Two accents on purpose: the dashboard's opinion panel is purple throughout,
// while a judge card inside the report sits on a level-coloured edge and would
// fight a second colour.
const ACCENT_CLASSES: Record<PitchingReasonQuoteAccent, { box: string; label: string }> = {
  charcoal: { box: 'border-charcoal/30 bg-charcoal/[0.04]', label: 'text-charcoal' },
  purple: { box: 'border-purple-banner bg-purple-banner/[0.05]', label: 'text-purple-banner' },
};

interface PitchingReasonQuoteProps {
  reason: string;
  accent: PitchingReasonQuoteAccent;
}

/** เหตุผลประกอบการพิจารณา — the judge's write-up, quoted apart from the boxes. */
export function PitchingReasonQuote({ reason, accent }: PitchingReasonQuoteProps) {
  const style = ACCENT_CLASSES[accent];

  return (
    <blockquote className={cn('rounded-lg border-l-2 px-3 py-2.5', style.box)}>
      <p className={cn('mb-1 flex items-center gap-1.5 text-xs font-medium', style.label)}>
        <MessageSquareQuote className="h-3.5 w-3.5" />
        {PITCHING_TEXT.verdictReasonLabel}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-main">{reason}</p>
    </blockquote>
  );
}
