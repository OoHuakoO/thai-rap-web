export * from './routes';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'App';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const API_TIMEOUT_MS = 10_000;
export const QUERY_STALE_TIME_MS = 60_000;
