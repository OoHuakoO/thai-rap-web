import api from '@/services/api';
import type { Province } from '../types/province.types';

export const provinceService = {
  getAll: () => api.get<Province[]>('/provinces').then((res) => res.data),
};
