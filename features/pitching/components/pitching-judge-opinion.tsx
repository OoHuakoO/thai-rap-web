'use client';

import { CircleAlert, CircleCheck, Quote } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/get-initials';
import {
  PITCHING_CONCERN_KEYS,
  PITCHING_DASHBOARD_TEXT,
  PITCHING_STRENGTHS_KEY,
} from '../constants/pitching.constants';
import type { Pitching } from '../types/pitching.types';

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

  if (!summary && strengths.length === 0 && concerns.length === 0) {
    return <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.opinionEmpty} />;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-purple-banner">
            <Quote className="h-4 w-4" />
            {PITCHING_DASHBOARD_TEXT.judgeOpinionTitle}
          </p>
          <p className="whitespace-pre-line text-sm text-charcoal">{summary}</p>
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(pitching.judgeName)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-text-main">{pitching.judgeName}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <OpinionList
            title={PITCHING_DASHBOARD_TEXT.strengthsTitle}
            titleClassName="text-score-green"
            items={strengths}
            icon={<CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-score-green" />}
          />
          <OpinionList
            title={PITCHING_DASHBOARD_TEXT.concernsTitle}
            titleClassName="text-score-red"
            items={concerns}
            icon={<CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-score-red" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface OpinionListProps {
  title: string;
  titleClassName: string;
  items: string[];
  icon: React.ReactNode;
}

function OpinionList({ title, titleClassName, items, icon }: OpinionListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className={cn('text-sm font-semibold', titleClassName)}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-charcoal">
            {icon}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
