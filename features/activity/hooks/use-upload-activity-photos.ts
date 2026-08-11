import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';
import { activityKeys } from './activity-keys';

export function useUploadActivityPhotos(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => activityService.uploadPhotos(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
