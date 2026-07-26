'use client';

import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { NEWS_FORM_TEXT, NEWS_TEXT } from '../constants/news.constants';
import { useNewsItem } from '../hooks/use-news-item';
import { useUpdateNews } from '../hooks/use-update-news';
import type { NewsFormValues } from '../schemas/news.schema';
import { NewsForm } from './news-form';

interface EditNewsFormProps {
  newsId: string;
}

export function EditNewsForm({ newsId }: EditNewsFormProps) {
  const { data: news, isLoading, isError, error } = useNewsItem(newsId);
  const { mutateAsync, isPending } = useUpdateNews(newsId);

  const handleSubmit = async (values: NewsFormValues) => {
    await mutateAsync(values);
    toast.success(NEWS_FORM_TEXT.updateSuccess);
  };

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!news) return <AlertCard variant="info" message={NEWS_TEXT.empty} />;

  return <NewsForm news={news} isSubmitting={isPending} onSubmit={handleSubmit} />;
}
