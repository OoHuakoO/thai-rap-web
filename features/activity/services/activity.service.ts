import api from '@/services/api';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Activity,
  ActivityQuery,
  CreateActivityDto,
  UpdateActivityDto,
} from '../types/activity.types';

export const activityService = {
  getAll: (query: ActivityQuery = {}) =>
    api.get<PaginatedResponse<Activity>>('/activities', { params: query }).then((res) => res.data),

  getById: (id: string) => api.get<Activity>(`/activities/${id}`).then((res) => res.data),

  create: (data: CreateActivityDto) =>
    api.post<Activity>('/activities', data).then((res) => res.data),

  update: (id: string, data: UpdateActivityDto) =>
    api.patch<Activity>(`/activities/${id}`, data).then((res) => res.data),

  remove: (id: string) => api.delete(`/activities/${id}`).then((res) => res.data),

  uploadPhotos: (id: string, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append('files', file);
    return api
      .post<Activity>(`/activities/${id}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  deletePhoto: (id: string, photoId: string) =>
    api.delete(`/activities/${id}/photos/${photoId}`).then((res) => res.data),
};
