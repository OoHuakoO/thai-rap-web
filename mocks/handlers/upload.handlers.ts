import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';

// Uploaded files are served from the API *origin*, not from under the /api/v1
// prefix — buildFileUrl() (utils/build-file-url.ts) resolves them that way, so
// these handlers must match the origin directly instead of ${API_URL}.
//
// Without them every <img src> / <a href> pointing at an upload falls through
// MSW's onUnhandledRequest: 'bypass' and hits the real API. When the backend
// isn't running that surfaces as an uncaught "TypeError: Failed to fetch"
// thrown from inside mockServiceWorker.js, which no app-level code can catch.
const UPLOADS_URL = `${new URL(API_URL).origin}/uploads/*`;

// 1x1 transparent PNG.
const PLACEHOLDER_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

function getExtension(pathname: string): string {
  return pathname.split('.').pop()?.toLowerCase() ?? '';
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export const uploadHandlers = [
  http.get(UPLOADS_URL, ({ request }) => {
    const extension = getExtension(new URL(request.url).pathname);
    const imageContentType = IMAGE_CONTENT_TYPES[extension];

    if (imageContentType) {
      return new HttpResponse(decodeBase64(PLACEHOLDER_PNG_BASE64), {
        headers: { 'Content-Type': imageContentType },
      });
    }

    // Documents (pdf/xlsx/docx/csv) — the mock has no real file to serve, so
    // return a plain-text stub rather than a broken binary.
    return new HttpResponse('mock file', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }),
];
