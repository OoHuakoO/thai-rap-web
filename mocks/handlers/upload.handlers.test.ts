import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { uploadHandlers } from './upload.handlers';
import { API_URL } from '@/constants';

const ORIGIN = new URL(API_URL).origin;

const server = setupServer(...uploadHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('uploadHandlers', () => {
  it('serves a placeholder image for an uploaded photo path', async () => {
    const res = await fetch(`${ORIGIN}/uploads/stores/1/cover.png`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });

  it('serves a text stub for an uploaded document path', async () => {
    const res = await fetch(`${ORIGIN}/uploads/stores/1/documents/doc-1.pdf`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('mock file');
  });
});
