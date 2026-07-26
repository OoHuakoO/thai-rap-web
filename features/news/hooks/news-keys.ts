import type { NewsQuery } from '../types/news.types';

export const newsKeys = {
  all: ['news'] as const,
  list: (query: NewsQuery) => ['news', 'list', query.type ?? 'all', query.limit ?? null] as const,
  detail: (id: string) => ['news', id] as const,
};
