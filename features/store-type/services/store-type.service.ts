import api from '@/services/api';
import type { StoreType } from '../types/store-type.types';

export const storeTypeService = {
  getAll: () => api.get<StoreType[]>('/store-types').then((res) => res.data),
};
