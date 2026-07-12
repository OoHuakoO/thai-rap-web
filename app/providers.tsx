'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { QUERY_STALE_TIME_MS } from '@/constants';
import { MockProvider } from './mock-provider';
import { AuthBootstrap } from './auth-bootstrap';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmDialogProvider } from '@/components/shared/confirm-dialog';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME_MS,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <MockProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        <Toaster position="top-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MockProvider>
  );
}
