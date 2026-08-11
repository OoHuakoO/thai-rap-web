import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';
import { activityKeys } from './activity-keys';

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => activityService.getById(id),
    enabled: Boolean(id),
  });
}
