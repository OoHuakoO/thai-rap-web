import { useQuery } from '@tanstack/react-query';
import { storeTypeService } from '../services/store-type.service';

export const storeTypeKeys = {
  all: ['store-types'] as const,
};

// Store types are seeded once server-side and effectively never change within a session.
const STORE_TYPE_STALE_TIME_MS = 24 * 60 * 60 * 1000;

export function useStoreTypes() {
  return useQuery({
    queryKey: storeTypeKeys.all,
    queryFn: () => storeTypeService.getAll(),
    staleTime: STORE_TYPE_STALE_TIME_MS,
  });
}
