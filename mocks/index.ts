export async function initMocks(): Promise<void> {
  // Never run in SSR — service workers are browser-only.
  if (typeof window === 'undefined') return;

  // Hard guard: mocks must never activate in production regardless of env vars.
  if (process.env.NODE_ENV === 'production') return;

  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true') return;

  // Dynamic import keeps MSW out of the production bundle entirely.
  const { worker } = await import('./browser');

  await worker.start({
    // Pass unhandled requests (real API calls) through to the network.
    // This lets you mock only the endpoints you care about and proxy the rest.
    onUnhandledRequest: 'bypass',
  });
}
