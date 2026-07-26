import { useQuery } from '@tanstack/react-query';
import { newsService } from '../services/news.service';
import { newsKeys } from './news-keys';

export function useNewsItem(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => newsService.getById(id),
    enabled: Boolean(id),
  });
}
