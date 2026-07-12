export * from './routes';
export * from './http-status';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'App';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const API_TIMEOUT_MS = 10_000;
export const QUERY_STALE_TIME_MS = 60_000;

// Program quota shown in the shared header (design: thai_rap.html header quota pill)
export const ASSESSMENT_ROUND_STORE_COUNT = 50;
export const INCUBATION_TARGET_COUNT = 20;
