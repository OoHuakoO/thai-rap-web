'use client';

import { useEffect, useState } from 'react';

interface MockProviderProps {
  children: React.ReactNode;
}

// Initializes MSW before the first render so no requests escape to the network
// before the service worker is ready. Renders null until the worker is started.
// When mocks are disabled the component is a transparent passthrough.
export function MockProvider({ children }: MockProviderProps) {
  const mocksEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true';

  // Start as ready when mocks are disabled — no need to wait for anything.
  const [ready, setReady] = useState(!mocksEnabled);

  useEffect(() => {
    if (!mocksEnabled) return;
    import('@/mocks')
      .then(({ initMocks }) => initMocks())
      .then(() => setReady(true));
  }, [mocksEnabled]);

  if (!ready) return null;

  return <>{children}</>;
}
