'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FieldError } from '@/components/shared/field-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { NEWS_FORM_TEXT, NEWS_TYPE_OPTIONS } from '../constants/news.constants';
import { newsFormSchema, type NewsFormValues } from '../schemas/news.schema';
import type { NewsItem } from '../types/news.types';

const DESCRIPTION_ROWS = 5;

interface NewsFormProps {
  /** Omitted when creating; supplied when editing an existing announcement. */
  news?: NewsItem;
  isSubmitting: boolean;
  onSubmit: (values: NewsFormValues) => Promise<unknown>;
}

export function NewsForm({ news, isSubmitting, onSubmit }: NewsFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      type: news?.type ?? 'GENERAL',
      title: news?.title ?? '',
      description: news?.description ?? '',
      urgent: news?.urgent ?? false,
    },
  });

  const handleValid = async (values: NewsFormValues) => {
    try {
      await onSubmit(values);
      router.push(ROUTES.NEWS);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleValid)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="type">{NEWS_FORM_TEXT.typeLabel}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder={NEWS_FORM_TEXT.typePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {NEWS_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.type?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">{NEWS_FORM_TEXT.titleLabel}</Label>
            <Input
              id="title"
              placeholder={NEWS_FORM_TEXT.titlePlaceholder}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{NEWS_FORM_TEXT.descriptionLabel}</Label>
            <Textarea
              id="description"
              rows={DESCRIPTION_ROWS}
              placeholder={NEWS_FORM_TEXT.descriptionPlaceholder}
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="urgent"
                render={({ field }) => (
                  <Checkbox
                    id="urgent"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label htmlFor="urgent" className="cursor-pointer">
                {NEWS_FORM_TEXT.urgentLabel}
              </Label>
            </div>
            <p className="text-xs text-charcoal">{NEWS_FORM_TEXT.urgentHint}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(ROUTES.NEWS)}>
              {NEWS_FORM_TEXT.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange text-white hover:bg-orange-light"
            >
              {news ? NEWS_FORM_TEXT.submitEdit : NEWS_FORM_TEXT.submitCreate}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
