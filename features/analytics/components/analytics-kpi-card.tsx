import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import {
  ANALYTICS_ACCENT_CLASS,
  type AnalyticsAccent,
} from '../constants/analytics-display.constants';

interface AnalyticsKpiCardProps {
  title: string;
  value: string;
  /** Small unit rendered on the value's baseline, e.g. "คะแนน" or "/ 100". */
  unit?: string;
  /** Caption under the value — tinted with the card's accent. */
  caption?: string;
  icon: LucideIcon;
  accent: AnalyticsAccent;
  /** Override the value's type scale for values that are words, not numbers. */
  valueClassName?: string;
}

export function AnalyticsKpiCard({
  title,
  value,
  unit,
  caption,
  icon: Icon,
  accent,
  valueClassName,
}: AnalyticsKpiCardProps) {
  const accentClass = ANALYTICS_ACCENT_CLASS[accent];

  return (
    <Card className="h-full shadow-sm">
      <CardContent className="flex h-full items-start gap-3 p-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            accentClass.circle
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium leading-tight text-charcoal">{title}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-1">
            <span className={cn('text-2xl font-bold tabular-nums text-text-main', valueClassName)}>
              {value}
            </span>
            {unit && <span className="text-xs text-charcoal">{unit}</span>}
          </p>
          {caption && (
            <p className={cn('mt-0.5 text-[11px] font-medium', accentClass.text)}>{caption}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
