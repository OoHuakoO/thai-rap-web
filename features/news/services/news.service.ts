import api from '@/services/api';
import type { CreateNewsDto, NewsItem, NewsQuery, UpdateNewsDto } from '../types/news.types';

export const newsService = {
  getAll: (query: NewsQuery = {}) =>
    api.get<NewsItem[]>('/news', { params: query }).then((res) => res.data),

  getById: (id: string) => api.get<NewsItem>(`/news/${id}`).then((res) => res.data),

  create: (data: CreateNewsDto) => api.post<NewsItem>('/news', data).then((res) => res.data),

  update: (id: string, data: UpdateNewsDto) =>
    api.patch<NewsItem>(`/news/${id}`, data).then((res) => res.data),

  remove: (id: string) => api.delete(`/news/${id}`).then((res) => res.data),
};
