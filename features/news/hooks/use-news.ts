import { useQuery } from '@tanstack/react-query';
import { newsService } from '../services/news.service';
import type { NewsQuery } from '../types/news.types';
import { newsKeys } from './news-keys';

export function useNews(query: NewsQuery = {}) {
  return useQuery({
    queryKey: newsKeys.list(query),
    queryFn: () => newsService.getAll(query),
  });
}
