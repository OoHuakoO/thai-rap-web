import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard';
import { newsService } from '../services/news.service';
import { newsKeys } from './news-keys';

export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activities() });
    },
  });
}
