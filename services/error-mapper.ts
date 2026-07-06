import axios from 'axios'
import { ApiError } from './api-error'
import type { ErrorCode } from './api-error'
import type { ApiErrorResponse } from '@/types/api.types'

function codeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400: return 'BAD_REQUEST'
    case 401: return 'UNAUTHORIZED'
    case 403: return 'FORBIDDEN'
    case 404: return 'NOT_FOUND'
    case 429: return 'RATE_LIMITED'
    case 503: return 'SERVICE_UNAVAILABLE'
    default:
      if (status >= 500) return 'SERVER_ERROR'
      return 'UNKNOWN'
  }
}

export function mapToApiError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return new ApiError({ message: 'Request cancelled', statusCode: 0, code: 'CANCELLED', isCancelled: true })
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED'
      return new ApiError({
        message: isTimeout ? 'Request timed out' : 'Network error — check your connection',
        statusCode: 0,
        code: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
        isNetworkError: true,
      })
    }

    const { status, data, headers } = error.response
    const body = data as ApiErrorResponse | undefined
    const retryAfter = headers['retry-after'] ? Number(headers['retry-after']) : undefined

    return new ApiError({
      message: body?.error?.message ?? error.message,
      statusCode: status,
      code: codeFromStatus(status),
      details: body?.error?.details,
      requestId: typeof headers['x-request-id'] === 'string' ? headers['x-request-id'] : undefined,
      retryAfter,
    })
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message, statusCode: 0, code: 'UNKNOWN' })
  }

  return new ApiError({ message: 'An unexpected error occurred', statusCode: 0, code: 'UNKNOWN' })
}
