'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, MapPin, Pencil } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { BackLink } from '@/components/shared/back-link';
import { CardSkeleton } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { buildFileUrl } from '@/utils/build-file-url';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDate } from '@/utils/format-thai-date';
import { ACTIVITY_DETAIL_TEXT, ACTIVITY_TEXT } from '../constants/activity.constants';
import { useActivity } from '../hooks/use-activity';
import { ActivityPhotoLightbox } from './activity-photo-lightbox';

interface ActivityDetailProps {
  activityId: string;
}

export function ActivityDetail({ activityId }: ActivityDetailProps) {
  const can = useAuthStore((state) => state.can);
  const canWrite = can(PERMISSIONS.ACTIVITY_WRITE);
  const { data: activity, isLoading, isError, error } = useActivity(activityId);
  const [openSrc, setOpenSrc] = useState<string | null>(null);

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!activity) return <AlertCard variant="info" message={ACTIVITY_TEXT.empty} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={ROUTES.ACTIVITIES}>{ACTIVITY_TEXT.backToList}</BackLink>
        {canWrite && (
          <Button asChild variant="outline">
            <Link href={ROUTES.ACTIVITY_EDIT(activity.id)}>
              <Pencil className="h-4 w-4" />
              {ACTIVITY_TEXT.editButton}
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-main">{activity.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-charcoal">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatThaiDate(activity.activityDate)}
              </span>
              {activity.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {activity.location}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text-main">
              {ACTIVITY_DETAIL_TEXT.descriptionLabel}
            </h3>
            <p className="whitespace-pre-line text-sm text-charcoal">{activity.description}</p>
          </div>

          {activity.note && (
            <div className="space-y-1 rounded-lg border-l-4 border-l-orange bg-orange/5 p-3">
              <h3 className="text-sm font-semibold text-text-main">
                {ACTIVITY_DETAIL_TEXT.noteLabel}
              </h3>
              <p className="whitespace-pre-line text-sm text-charcoal">{activity.note}</p>
            </div>
          )}

          <p className="text-xs text-charcoal">
            {ACTIVITY_DETAIL_TEXT.createdByPrefix} {activity.createdByName}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 pt-6">
          <h3 className="text-sm font-semibold text-text-main">
            {ACTIVITY_DETAIL_TEXT.photosLabel} ({ACTIVITY_TEXT.photoCount(activity.photoCount)})
          </h3>

          {activity.photos.length === 0 ? (
            <AlertCard variant="info" message={ACTIVITY_DETAIL_TEXT.photoEmpty} />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activity.photos.map((photo, index) => (
                <li key={photo.id}>
                  <button
                    type="button"
                    onClick={() => setOpenSrc(buildFileUrl(photo.url))}
                    className="block w-full overflow-hidden rounded-lg border"
                    aria-label={ACTIVITY_DETAIL_TEXT.viewPhotoLabel(index)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildFileUrl(photo.url)}
                      alt={activity.title}
                      className="h-40 w-full object-cover transition-transform hover:scale-105"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ActivityPhotoLightbox
        src={openSrc}
        onClose={() => setOpenSrc(null)}
        label={activity.title}
      />
    </div>
  );
}
