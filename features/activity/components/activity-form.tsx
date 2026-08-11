'use client';

import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FieldError } from '@/components/shared/field-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACTIVITY_FORM_TEXT } from '../constants/activity.constants';
import { activityFormSchema, type ActivityFormValues } from '../schemas/activity.schema';
import type { Activity } from '../types/activity.types';
import { toActivityFormValues } from '../utils/activity-form-values';

const DESCRIPTION_ROWS = 5;
const NOTE_ROWS = 3;

interface ActivityFormProps {
  /** Omitted when creating; supplied when editing an existing activity. */
  activity?: Activity;
  /** Owns navigation on success — only the caller knows the id it just created. */
  onSubmit: (values: ActivityFormValues) => Promise<unknown>;
  /** Where the cancel button goes. */
  cancelTo: string;
  /** The photo section: a buffered picker on create, the live manager on edit. */
  photoSection?: ReactNode;
}

export function ActivityForm({ activity, onSubmit, cancelTo, photoSection }: ActivityFormProps) {
  const router = useRouter();

  // The submit gate is react-hook-form's own flag, not the caller's mutation
  // state: `onSubmit` is awaited here in full, and the create form keeps working
  // after its mutation resolves — it uploads the buffered photos next. A gate
  // reading `isPending` re-opens the button in that gap and a second click
  // saves the album twice.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: toActivityFormValues(activity),
  });

  const handleValid = async (values: ActivityFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleValid)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">{ACTIVITY_FORM_TEXT.titleLabel}</Label>
            <Input
              id="title"
              placeholder={ACTIVITY_FORM_TEXT.titlePlaceholder}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{ACTIVITY_FORM_TEXT.descriptionLabel}</Label>
            <Textarea
              id="description"
              rows={DESCRIPTION_ROWS}
              placeholder={ACTIVITY_FORM_TEXT.descriptionPlaceholder}
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="activityDate">{ACTIVITY_FORM_TEXT.activityDateLabel}</Label>
              <Input id="activityDate" type="date" {...register('activityDate')} />
              <FieldError message={errors.activityDate?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">
                {ACTIVITY_FORM_TEXT.locationLabel} {ACTIVITY_FORM_TEXT.optionalSuffix}
              </Label>
              <Input
                id="location"
                placeholder={ACTIVITY_FORM_TEXT.locationPlaceholder}
                {...register('location')}
              />
              <FieldError message={errors.location?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">
              {ACTIVITY_FORM_TEXT.noteLabel} {ACTIVITY_FORM_TEXT.optionalSuffix}
            </Label>
            <Textarea
              id="note"
              rows={NOTE_ROWS}
              placeholder={ACTIVITY_FORM_TEXT.notePlaceholder}
              {...register('note')}
            />
            <FieldError message={errors.note?.message} />
          </div>

          {photoSection}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(cancelTo)}>
              {ACTIVITY_FORM_TEXT.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange text-white hover:bg-orange-light"
            >
              {activity ? ACTIVITY_FORM_TEXT.submitEdit : ACTIVITY_FORM_TEXT.submitCreate}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
