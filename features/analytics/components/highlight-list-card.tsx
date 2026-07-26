import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import {
  ANALYTICS_ACCENT_CLASS,
  type AnalyticsAccent,
} from '../constants/analytics-display.constants';
import { HIGHLIGHT_CARD_TEXT } from '../constants/analytics-text.constants';
import type { DimensionHighlight } from '../types/analytics.types';

interface HighlightListCardProps {
  title: string;
  items: DimensionHighlight[];
  emptyMessage: string;
  icon: LucideIcon;
  accent: AnalyticsAccent;
}

export function HighlightListCard({
  title,
  items,
  emptyMessage,
  icon: Icon,
  accent,
}: HighlightListCardProps) {
  const accentClass = ANALYTICS_ACCENT_CLASS[accent];

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader
        className={cn('flex flex-row items-center gap-2 space-y-0 py-2.5', accentClass.header)}
      >
        <Icon className={cn('h-4 w-4 shrink-0', accentClass.text)} />
        <CardTitle className={cn('text-[13px] font-semibold', accentClass.text)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2.5">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item.dimensionId}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="flex min-w-0 items-center gap-1.5 text-charcoal">
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', accentClass.dot)} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-text-main">
                  {HIGHLIGHT_CARD_TEXT.scoreOutOf(item.score)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
