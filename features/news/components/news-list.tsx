'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { CardSkeleton } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import { cn } from '@/utils/cn';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDate } from '@/utils/format-thai-date';
import {
  NEWS_DIALOG_TEXT,
  NEWS_TEXT,
  NEWS_TYPE_DISPLAY,
  NEWS_TYPE_OPTIONS,
} from '../constants/news.constants';
import { useDeleteNews } from '../hooks/use-delete-news';
import { useNews } from '../hooks/use-news';
import type { NewsItem, NewsType } from '../types/news.types';

const ALL_TYPES = 'all';

export function NewsList() {
  const router = useRouter();
  const confirm = useConfirm();
  const can = useAuthStore((state) => state.can);
  const canWrite = can(PERMISSIONS.NEWS_WRITE);

  const [typeValue, setTypeValue] = useState<string>(ALL_TYPES);
  const type = typeValue === ALL_TYPES ? undefined : (typeValue as NewsType);

  const { data: items, isLoading, isError, error } = useNews({ type });
  const { mutate: deleteNews } = useDeleteNews();

  const handleDelete = async (item: NewsItem) => {
    const confirmed = await confirm({
      title: NEWS_DIALOG_TEXT.deleteTitle,
      description: NEWS_DIALOG_TEXT.deleteDescription(item.title),
      confirmLabel: NEWS_DIALOG_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;

    deleteNews(item.id, {
      onSuccess: () => toast.success(NEWS_DIALOG_TEXT.deleteSuccess),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={typeValue} onValueChange={setTypeValue}>
          <SelectTrigger className="w-52" aria-label={NEWS_TEXT.typeFilterLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>{NEWS_TEXT.allTypes}</SelectItem>
            {NEWS_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canWrite && (
          <Button
            onClick={() => router.push(ROUTES.NEWS_NEW)}
            className="bg-orange text-white hover:bg-orange-light"
          >
            <Plus className="h-4 w-4" />
            {NEWS_TEXT.createButton}
          </Button>
        )}
      </div>

      {isLoading && <CardSkeleton />}

      {!isLoading && isError && <AlertCard variant="error" message={extractErrorMessage(error)} />}

      {!isLoading && !isError && !items?.length && (
        <AlertCard variant="info" message={NEWS_TEXT.empty} />
      )}

      {!isLoading &&
        !isError &&
        items?.map((item) => {
          const display = NEWS_TYPE_DISPLAY[item.type];
          const Icon = display.icon;

          return (
            <Card
              key={item.id}
              className={cn('shadow-sm', item.urgent && 'border-l-4 border-l-orange')}
            >
              <CardContent className="flex items-start gap-3 pt-6">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    display.iconBoxClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={display.badgeClass}>
                      {display.label}
                    </Badge>
                    {item.urgent && (
                      <Badge variant="outline" className="border-orange/20 bg-orange/10 text-orange">
                        {NEWS_TEXT.urgentBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-text-main">{item.title}</p>
                  <p className="whitespace-pre-line text-sm text-charcoal">{item.description}</p>
                  <p className="text-xs text-charcoal">
                    {formatThaiDate(item.publishedAt)} · {NEWS_TEXT.authorPrefix} {item.authorName}
                  </p>
                </div>

                {canWrite && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${NEWS_TEXT.editButton} ${item.title}`}
                      onClick={() => router.push(ROUTES.NEWS_EDIT(item.id))}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${NEWS_TEXT.deleteButton} ${item.title}`}
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
