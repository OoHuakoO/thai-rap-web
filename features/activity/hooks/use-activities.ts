import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';
import type { ActivityQuery } from '../types/activity.types';
import { activityKeys } from './activity-keys';

export function useActivities(query: ActivityQuery = {}) {
  return useQuery({
    queryKey: activityKeys.list(query),
    queryFn: () => activityService.getAll(query),
  });
}
