'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACTIVITY_FORM_TEXT } from '../constants/activity.constants';
import { useCreateActivity } from '../hooks/use-create-activity';
import type { ActivityFormValues } from '../schemas/activity.schema';
import { activityService } from '../services/activity.service';
import { toActivityDto } from '../utils/activity-form-values';
import { ActivityForm } from './activity-form';
import { ActivityPhotoPicker } from './activity-photo-picker';

export function CreateActivityForm() {
  const router = useRouter();
  const { mutateAsync } = useCreateActivity();
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (values: ActivityFormValues) => {
    const activity = await mutateAsync(toActivityDto(values));

    // The picker buffered these before the album existed. A failed upload must
    // not undo a saved album, so it is reported and the album still opens.
    // The whole batch is one request, so a failure loses all of it — the message
    // counts the photos rather than naming one of them.
    if (files.length > 0) {
      await activityService.uploadPhotos(activity.id, files).catch((err) => {
        toast.error(ACTIVITY_FORM_TEXT.photoUploadError(files.length, extractErrorMessage(err)));
      });
    }

    toast.success(ACTIVITY_FORM_TEXT.createSuccess);
    router.push(ROUTES.ACTIVITY_DETAIL(activity.id));
  };

  return (
    <ActivityForm
      onSubmit={handleSubmit}
      cancelTo={ROUTES.ACTIVITIES}
      photoSection={<ActivityPhotoPicker files={files} onChange={setFiles} />}
    />
  );
}
