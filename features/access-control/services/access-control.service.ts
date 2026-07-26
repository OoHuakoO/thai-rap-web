import api from '@/services/api';
import type { AccessControlConfig, UpdateAccessControlDto } from '@/types/auth.types';

export const accessControlService = {
  get: () => api.get<AccessControlConfig>('/access-control').then((res) => res.data),
  update: (data: UpdateAccessControlDto) =>
    api.put<AccessControlConfig>('/access-control', data).then((res) => res.data),
  reset: () => api.post<AccessControlConfig>('/access-control/reset').then((res) => res.data),
};
