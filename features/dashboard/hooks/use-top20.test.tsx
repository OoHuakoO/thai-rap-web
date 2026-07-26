import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardService } from '../services/dashboard.service';
import type { Top20Entry, Top20RoundFilter } from '../types/dashboard.types';
import { dashboardKeys } from './dashboard-keys';
import { useTop20 } from './use-top20';

vi.mock('../services/dashboard.service');

const entry: Top20Entry = {
  rank: 1,
  storeId: 'store-01',
  storeName: 'ครัวริมธารจันทบุรี',
  province: 'จันทบุรี',
  storeType: 'อาหารไทย',
  t1Score: 92.45,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useTop20', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the top 20 entries when the API succeeds', async () => {
    vi.mocked(dashboardService.getTop20).mockResolvedValue([entry]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTop20('all'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([entry]);
    expect(dashboardService.getTop20).toHaveBeenCalledWith('all');
  });

  it('returns an error when the API fails', async () => {
    vi.mocked(dashboardService.getTop20).mockRejectedValue(new Error('Server error'));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTop20('all'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('caches each round under its own query key', async () => {
    vi.mocked(dashboardService.getTop20).mockResolvedValue([entry]);
    const { Wrapper, queryClient } = createWrapper();

    const { result, rerender } = renderHook(
      ({ round }: { round: Top20RoundFilter }) => useTop20(round),
      {
        wrapper: Wrapper,
        initialProps: { round: 'all' as Top20RoundFilter },
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ round: 'T1' as Top20RoundFilter });
    await waitFor(() => expect(dashboardService.getTop20).toHaveBeenCalledWith('T1'));

    expect(queryClient.getQueryData(dashboardKeys.top20('all'))).toEqual([entry]);
    expect(queryClient.getQueryData(dashboardKeys.top20('T1'))).toEqual([entry]);
  });
});
