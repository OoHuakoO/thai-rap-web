import { HttpResponse } from 'msw';
import { HTTP_STATUS } from '@/constants/http-status';
import type { ApiErrorResponse } from '@/types/api.types';

// Shared X-Mock-Scenario helpers — every domain handler file reads the same
// header and builds the same generic error shapes, so this is the single
// source of truth instead of copy-pasting these functions per file.
// Handler-specific errors (custom messages/codes, e.g. auth login failure)
// stay local to their own handler file.

export function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success';
}

export function unauthorized(message = 'Unauthorized'): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_003', message } },
    { status: HTTP_STATUS.UNAUTHORIZED }
  );
}

export function forbidden(message = 'Forbidden resource'): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'PERM_001', message } },
    { status: HTTP_STATUS.FORBIDDEN }
  );
}

export function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
    { status: HTTP_STATUS.SERVER_ERROR }
  );
}

export function notFound(code: string, message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code, message } },
    { status: HTTP_STATUS.NOT_FOUND }
  );
}

export function validationError(details: { field: string; message: string }[]): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'VALID_002', message: 'Validation failed', details } },
    { status: HTTP_STATUS.UNPROCESSABLE_ENTITY }
  );
}

// Mock access tokens are minted as `mock-access-<userId>` (see auth.handlers.ts
// mockTokens()) — parsing the Authorization header back to a userId lets
// write handlers attribute records to the actual logged-in mock user instead
// of a hardcoded placeholder id.
export function getMockUserId(request: Request): string | null {
  const header = request.headers.get('Authorization');
  const match = header?.match(/^Bearer mock-access-(.+)$/);
  return match ? match[1] : null;
}
