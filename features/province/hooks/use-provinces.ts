import { useQuery } from '@tanstack/react-query';
import { provinceService } from '../services/province.service';

export const provinceKeys = {
  all: ['provinces'] as const,
};

// Provinces are seeded once server-side and effectively never change within a session.
const PROVINCE_STALE_TIME_MS = 24 * 60 * 60 * 1000;

export function useProvinces() {
  return useQuery({
    queryKey: provinceKeys.all,
    queryFn: () => provinceService.getAll(),
    staleTime: PROVINCE_STALE_TIME_MS,
  });
}
