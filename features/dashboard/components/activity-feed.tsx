'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { useActivity } from '../hooks/use-dashboard';
import { ACTIVITY_FEED_TEXT } from '../constants/dashboard-cards.constants';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDate } from '@/utils/format-thai-date';

export function ActivityFeed() {
  const { data: items, isLoading, isError, error } = useActivity();

  if (isLoading) return <CardSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        </CardContent>
      </Card>
    );
  }

  if (!items?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{ACTIVITY_FEED_TEXT.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-1">
            <AlertCard variant={item.variant} title={item.title} message={item.message} />
            <p className="px-1 text-xs text-muted-foreground">{formatThaiDate(item.timestamp)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
