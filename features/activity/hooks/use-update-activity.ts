import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';
import type { UpdateActivityDto } from '../types/activity.types';
import { activityKeys } from './activity-keys';

export function useUpdateActivity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateActivityDto) => activityService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
