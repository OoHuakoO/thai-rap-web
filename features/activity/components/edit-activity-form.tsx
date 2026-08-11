'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACTIVITY_FORM_TEXT, ACTIVITY_TEXT } from '../constants/activity.constants';
import { useActivity } from '../hooks/use-activity';
import { useUpdateActivity } from '../hooks/use-update-activity';
import type { ActivityFormValues } from '../schemas/activity.schema';
import { toActivityDto } from '../utils/activity-form-values';
import { ActivityForm } from './activity-form';
import { ActivityPhotoManager } from './activity-photo-manager';

interface EditActivityFormProps {
  activityId: string;
}

export function EditActivityForm({ activityId }: EditActivityFormProps) {
  const router = useRouter();
  const { data: activity, isLoading, isError, error } = useActivity(activityId);
  const { mutateAsync } = useUpdateActivity(activityId);

  const handleSubmit = async (values: ActivityFormValues) => {
    await mutateAsync(toActivityDto(values));
    toast.success(ACTIVITY_FORM_TEXT.updateSuccess);
    router.push(ROUTES.ACTIVITY_DETAIL(activityId));
  };

  if (isLoading) return <CardSkeleton />;
  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
  if (!activity) return <AlertCard variant="info" message={ACTIVITY_TEXT.empty} />;

  return (
    <ActivityForm
      activity={activity}
      onSubmit={handleSubmit}
      cancelTo={ROUTES.ACTIVITY_DETAIL(activityId)}
      // Photos on an existing album upload immediately — they are not part of
      // the form submit, so a photo added here survives a cancelled edit.
      photoSection={<ActivityPhotoManager activityId={activityId} photos={activity.photos} />}
    />
  );
}
