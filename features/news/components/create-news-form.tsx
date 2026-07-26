'use client';

import { toast } from 'sonner';
import { NEWS_FORM_TEXT } from '../constants/news.constants';
import { useCreateNews } from '../hooks/use-create-news';
import type { NewsFormValues } from '../schemas/news.schema';
import { NewsForm } from './news-form';

export function CreateNewsForm() {
  const { mutateAsync, isPending } = useCreateNews();

  const handleSubmit = async (values: NewsFormValues) => {
    await mutateAsync(values);
    toast.success(NEWS_FORM_TEXT.createSuccess);
  };

  return <NewsForm isSubmitting={isPending} onSubmit={handleSubmit} />;
}
