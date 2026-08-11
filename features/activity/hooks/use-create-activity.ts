import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';
import { activityKeys } from './activity-keys';

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
