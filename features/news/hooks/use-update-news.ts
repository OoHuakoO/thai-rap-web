import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import { newsService } from '../services/news.service';
import type { UpdateNewsDto } from '../types/news.types';
import { newsKeys } from './news-keys';

export function useUpdateNews(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNewsDto) => newsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activities() });
    },
  });
}
