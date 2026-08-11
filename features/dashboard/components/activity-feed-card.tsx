'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACTIVITY_DISPLAY } from '../constants/dashboard-display.constants';
import { ACTIVITY_FEED_TEXT } from '../constants/dashboard-text.constants';
import { useActivities } from '../hooks/use-activities';
import { formatShortDataDate } from '../utils/format-data-date';
import { CardFooterLink } from './card-footer-link';

export function ActivityFeedCard() {
  const { data: activities, isLoading, isError, error } = useActivities();
  // Every role that reaches this card holds news:read, so the link shows for
  // all of them today. The check stays so the footer follows whatever /news is
  // gated on, not a copy of it.
  const canOpenNews = useAuthStore((s) => s.canRoute(ROUTES.NEWS));

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">
          {ACTIVITY_FEED_TEXT.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {isLoading && <CardSkeleton />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && !activities?.length && (
          <AlertCard variant="info" message={ACTIVITY_FEED_TEXT.empty} />
        )}

        {!isLoading && !isError && !!activities?.length && (
          <ul className="space-y-3">
            {activities.map((activity) => {
              const display = ACTIVITY_DISPLAY[activity.type];
              const Icon = display.icon;

              return (
                <li
                  key={`${activity.type}-${activity.title}`}
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-3',
                    display.rowClass,
                    activity.urgent && display.urgentBorderClass
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      display.iconBoxClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-main">{activity.title}</p>
                    <p className="mt-0.5 text-[11px] text-charcoal">{activity.description}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-charcoal">
                    {formatShortDataDate(activity.date)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {canOpenNews && !!activities?.length && (
          <div className="mt-auto flex justify-end pt-1">
            <CardFooterLink href={ROUTES.NEWS} label={ACTIVITY_FEED_TEXT.footerLink} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
