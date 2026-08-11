import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';
import { activityKeys } from './activity-keys';

export function useDeleteActivityPhoto(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => activityService.deletePhoto(id, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
