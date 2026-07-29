'use client';

import { ArrowRight } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { MaskIcon } from '@/components/shared/mask-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  INCUBATION_LAST_STEP_ACCENT,
  INCUBATION_STEP_BADGES,
  INCUBATION_STEP_ICONS,
  KPI_ACCENT_CLASS,
} from '../constants/dashboard-display.constants';
import { INCUBATION_PROGRESS_TEXT } from '../constants/dashboard-text.constants';
import { useIncubationProgress } from '../hooks/use-incubation-progress';
import { getIncubationStatus } from '../utils/incubation-status';

const BADGE_CLASS = {
  reached: 'bg-orange text-white',
  pending: 'bg-charcoal text-white',
} as const;

// ~87% of the circle's h-16 diameter — the artwork reads too small below this.
const ICON_CLASS = 'h-14 w-14';

export function IncubationProgressCard() {
  const { data: steps, isLoading, isError, error } = useIncubationProgress();

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">
          {INCUBATION_PROGRESS_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pb-3">
        {isLoading && <CardSkeleton />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && !steps?.length && (
          <AlertCard variant="info" message={INCUBATION_PROGRESS_TEXT.empty} />
        )}

        {!isLoading && !isError && !!steps?.length && (
          <div className="my-auto overflow-x-auto">
            <div className="flex min-w-[480px] items-start gap-1">
              {steps.map((step, index) => {
                const iconSrc = INCUBATION_STEP_ICONS[index % INCUBATION_STEP_ICONS.length];
                const isLast = index === steps.length - 1;
                const accent = isLast ? INCUBATION_LAST_STEP_ACCENT : 'orange';
                const isReached = getIncubationStatus(step.percentage) !== 'pending';

                return (
                  <div key={step.label} className="flex flex-1 items-start">
                    <div className="flex flex-1 flex-col items-center gap-2 text-center">
                      <span
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-full',
                          KPI_ACCENT_CLASS[accent].circle
                        )}
                      >
                        <MaskIcon src={iconSrc} className={ICON_CLASS} />
                      </span>

                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold',
                          isReached ? BADGE_CLASS.reached : BADGE_CLASS.pending
                        )}
                      >
                        {INCUBATION_STEP_BADGES[index % INCUBATION_STEP_BADGES.length]}
                      </span>

                      <div className="space-y-0.5">
                        <p className="text-[11px] font-medium text-text-main">{step.label}</p>
                        <p className="text-[11px] text-charcoal">
                          {INCUBATION_PROGRESS_TEXT.storeCount(step.count)}
                        </p>
                        <p className="text-[11px] font-semibold tabular-nums text-charcoal">
                          {INCUBATION_PROGRESS_TEXT.percentage(step.percentage)}
                        </p>
                      </div>
                    </div>

                    {!isLast && (
                      <ArrowRight aria-hidden className="mt-6 h-4 w-4 shrink-0 text-orange/60" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
