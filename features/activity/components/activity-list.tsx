'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, Images, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { CardSkeleton } from '@/components/shared/loading';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { buildFileUrl } from '@/utils/build-file-url';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDate } from '@/utils/format-thai-date';
import {
  ACTIVITY_DIALOG_TEXT,
  ACTIVITY_PAGE_SIZE,
  ACTIVITY_TEXT,
} from '../constants/activity.constants';
import { useActivities } from '../hooks/use-activities';
import { useDeleteActivity } from '../hooks/use-delete-activity';
import type { Activity } from '../types/activity.types';

export function ActivityList() {
  const router = useRouter();
  const confirm = useConfirm();
  const can = useAuthStore((state) => state.can);
  const canWrite = can(PERMISSIONS.ACTIVITY_WRITE);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(ACTIVITY_PAGE_SIZE);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error } = useActivities({
    search: debouncedSearch || undefined,
    page,
    limit,
  });
  const { mutate: deleteActivity } = useDeleteActivity();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (activity: Activity) => {
    const confirmed = await confirm({
      title: ACTIVITY_DIALOG_TEXT.deleteTitle,
      description: ACTIVITY_DIALOG_TEXT.deleteDescription(activity.title),
      confirmLabel: ACTIVITY_DIALOG_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;

    deleteActivity(activity.id, {
      onSuccess: () => toast.success(ACTIVITY_DIALOG_TEXT.deleteSuccess),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label={ACTIVITY_TEXT.searchLabel}
            placeholder={ACTIVITY_TEXT.searchPlaceholder}
            className="pl-9"
          />
        </div>

        {canWrite && (
          <Button
            onClick={() => router.push(ROUTES.ACTIVITY_NEW)}
            className="bg-orange text-white hover:bg-orange-light"
          >
            <Plus className="h-4 w-4" />
            {ACTIVITY_TEXT.createButton}
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {!isLoading && isError && <AlertCard variant="error" message={extractErrorMessage(error)} />}

      {!isLoading && !isError && items.length === 0 && (
        <AlertCard
          variant="info"
          message={debouncedSearch ? ACTIVITY_TEXT.emptySearch : ACTIVITY_TEXT.empty}
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              canWrite={canWrite}
              onDelete={() => handleDelete(activity)}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && meta && meta.total > 0 && (
        <PaginationBar
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
          itemLabel={ACTIVITY_TEXT.itemLabel}
        />
      )}
    </div>
  );
}

interface ActivityCardProps {
  activity: Activity;
  canWrite: boolean;
  onDelete: () => void;
}

function ActivityCard({ activity, canWrite, onDelete }: ActivityCardProps) {
  const cover = activity.photos[0];

  return (
    <Card className="flex flex-col overflow-hidden shadow-sm">
      <Link
        href={ROUTES.ACTIVITY_DETAIL(activity.id)}
        className="block aspect-[4/3] w-full bg-muted"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildFileUrl(cover.url)}
            alt={activity.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-charcoal">
            <Images className="h-6 w-6" />
            <span className="text-xs">{ACTIVITY_TEXT.noPhotoLabel}</span>
          </span>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={ROUTES.ACTIVITY_DETAIL(activity.id)}
            className="font-semibold text-text-main hover:text-orange"
          >
            {activity.title}
          </Link>
          <Badge variant="outline" className="shrink-0 border-orange/20 bg-orange/10 text-orange">
            {ACTIVITY_TEXT.photoCount(activity.photoCount)}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-charcoal">{activity.description}</p>

        <div className="mt-auto space-y-1 text-xs text-charcoal">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatThaiDate(activity.activityDate)}
          </p>
          {activity.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {activity.location}
            </p>
          )}
        </div>

        {canWrite && (
          <div className="flex justify-end gap-1 border-t pt-2">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={ROUTES.ACTIVITY_EDIT(activity.id)}
                aria-label={`${ACTIVITY_TEXT.editButton} ${activity.title}`}
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${ACTIVITY_TEXT.deleteButton} ${activity.title}`}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
