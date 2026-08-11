import type { ActivityQuery } from '../types/activity.types';

export const activityKeys = {
  all: ['activities'] as const,
  list: (query: ActivityQuery) =>
    ['activities', 'list', query.search ?? '', query.page ?? 1, query.limit ?? null] as const,
  detail: (id: string) => ['activities', id] as const,
};
