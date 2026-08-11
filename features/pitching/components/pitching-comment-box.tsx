'use client';

import { CircleAlert, CircleCheck, Lightbulb, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PITCHING_TEXT, type PitchingCommentTone } from '../constants/pitching.constants';

// A comment box's colour is what it is about, not who wrote it: green for what
// works, red for what does not, purple for upside, orange for the next step.
const TONE_STYLES: Record<PitchingCommentTone, { box: string; text: string; icon: LucideIcon }> = {
  positive: {
    box: 'border-score-green/25 bg-score-green/[0.06]',
    text: 'text-score-green',
    icon: CircleCheck,
  },
  concern: {
    box: 'border-score-red/25 bg-score-red/[0.06]',
    text: 'text-score-red',
    icon: CircleAlert,
  },
  potential: {
    box: 'border-purple-banner/25 bg-purple-banner/[0.06]',
    text: 'text-purple-banner',
    icon: TrendingUp,
  },
  advice: {
    box: 'border-orange/25 bg-orange/[0.06]',
    text: 'text-orange',
    icon: Lightbulb,
  },
};

interface PitchingCommentBoxProps {
  label: string;
  value: string | undefined;
  tone: PitchingCommentTone;
}

/**
 * One comment box. A box the judge left blank still shows — a missing answer is
 * itself a finding — but drops to a dashed grey outline so a scan reads the
 * filled ones first.
 */
export function PitchingCommentBox({ label, value, tone }: PitchingCommentBoxProps) {
  const text = value?.trim() ?? '';
  const style = TONE_STYLES[tone];
  const Icon = style.icon;

  if (!text) {
    return (
      <div className="space-y-1 rounded-lg border border-dashed bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{PITCHING_TEXT.noCommentHint}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1 rounded-lg border p-3', style.box)}>
      <p className={cn('flex items-center gap-1.5 text-xs font-semibold', style.text)}>
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        {label}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-main">{text}</p>
    </div>
  );
}
