import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard';
import { newsService } from '../services/news.service';
import { newsKeys } from './news-keys';

export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      // The dashboard activity feed renders these same items.
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activities() });
    },
  });
}
