'use client';

import { CircleAlert, CircleCheck, Quote } from 'lucide-react';
import type { ReactNode } from 'react';
import { AlertCard } from '@/components/shared/alert-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/get-initials';
import {
  PITCHING_CONCERN_KEYS,
  PITCHING_DASHBOARD_TEXT,
  PITCHING_STRENGTHS_KEY,
} from '../constants/pitching.constants';
import type { Pitching } from '../types/pitching.types';
import { PitchingPanel } from './pitching-panel';

interface PitchingJudgeOpinionProps {
  pitching: Pitching;
}

/** Each comment box is free text; the judge's own line breaks are its bullets. */
function toBullets(value: string | undefined): string[] {
  return (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function PitchingJudgeOpinion({ pitching }: PitchingJudgeOpinionProps) {
  const strengths = toBullets(pitching.comments[PITCHING_STRENGTHS_KEY]);
  const concerns = toBullets(pitching.comments[PITCHING_CONCERN_KEYS[pitching.round]]);
  const summary = pitching.recommendationReason?.trim() ?? '';
  const isEmpty = !summary && strengths.length === 0 && concerns.length === 0;

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.judgeOpinionTitle}
      icon={Quote}
      accent="purple"
      contentClassName="gap-4"
    >
      {isEmpty ? (
        <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.opinionEmpty} />
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-purple-banner/10 text-purple-banner">
                {getInitials(pitching.judgeName)}
              </AvatarFallback>
            </Avatar>
            <p className="min-w-0 truncate text-sm font-semibold text-text-main">
              {pitching.judgeName}
            </p>
          </div>

          {summary && (
            <blockquote className="rounded-lg border-l-2 border-purple-banner bg-purple-banner/[0.05] px-3 py-2.5 text-sm leading-relaxed text-charcoal">
              <p className="whitespace-pre-line">{summary}</p>
            </blockquote>
          )}

          <div className="grid flex-1 content-start gap-4 xl:grid-cols-2">
            <OpinionList
              title={PITCHING_DASHBOARD_TEXT.strengthsTitle}
              titleClassName="text-score-green"
              boxClassName="border-score-green/20 bg-score-green/[0.05]"
              items={strengths}
              icon={<CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-score-green" />}
            />
            <OpinionList
              title={PITCHING_DASHBOARD_TEXT.concernsTitle}
              titleClassName="text-score-red"
              boxClassName="border-score-red/20 bg-score-red/[0.05]"
              items={concerns}
              icon={<CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-score-red" />}
            />
          </div>
        </>
      )}
    </PitchingPanel>
  );
}

interface OpinionListProps {
  title: string;
  titleClassName: string;
  boxClassName: string;
  items: string[];
  icon: ReactNode;
}

function OpinionList({ title, titleClassName, boxClassName, items, icon }: OpinionListProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('space-y-1.5 rounded-xl border p-3', boxClassName)}>
      <p className={cn('text-sm font-semibold', titleClassName)}>{title}</p>
      {/* Keyed by position: a bullet is free text a judge typed, so two
          identical lines are ordinary — and duplicate keys would make React
          reuse the wrong row. */}
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm text-charcoal">
            {icon}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
