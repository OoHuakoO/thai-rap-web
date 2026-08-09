'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';

export type PitchingPanelAccent = 'orange' | 'purple' | 'green' | 'charcoal';

const ACCENT_CLASSES: Record<PitchingPanelAccent, string> = {
  orange: 'bg-orange/10 text-orange',
  purple: 'bg-purple-banner/10 text-purple-banner',
  green: 'bg-score-green/10 text-score-green',
  charcoal: 'bg-charcoal/10 text-charcoal',
};

interface PitchingPanelProps {
  title: string;
  /** Rendered under the title — the "(Top 10)" / "(จากกรรมการทั้งหมด)" qualifier. */
  subtitle?: string;
  icon: LucideIcon;
  accent?: PitchingPanelAccent;
  /** Far right of the header strip — a link or a small control. */
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * The dashboard's card shell. Every panel is `h-full` so the cards in a grid
 * row end level with the tallest one instead of each leaving its own ragged
 * gap, and the body is a flex column so a panel with little content can push
 * its footer down rather than floating in the middle of the card.
 */
export function PitchingPanel({
  title,
  subtitle,
  icon: Icon,
  accent = 'orange',
  action,
  className,
  contentClassName,
  children,
}: PitchingPanelProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-3">
        <span
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
            ACCENT_CLASSES[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-main">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>

      <div className={cn('flex flex-1 flex-col gap-3 p-4', contentClassName)}>{children}</div>
    </Card>
  );
}
