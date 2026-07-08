import axios from 'axios'
import { ApiError } from './api-error'
import type { ErrorCode } from './api-error'
import type { ApiErrorResponse } from '@/types/api.types'
import { HTTP_STATUS } from '@/constants/http-status'

function codeFromStatus(status: number): ErrorCode {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST: return 'BAD_REQUEST'
    case HTTP_STATUS.UNAUTHORIZED: return 'UNAUTHORIZED'
    case HTTP_STATUS.FORBIDDEN: return 'FORBIDDEN'
    case HTTP_STATUS.NOT_FOUND: return 'NOT_FOUND'
    case HTTP_STATUS.RATE_LIMITED: return 'RATE_LIMITED'
    case HTTP_STATUS.SERVICE_UNAVAILABLE: return 'SERVICE_UNAVAILABLE'
    default:
      if (status >= HTTP_STATUS.SERVER_ERROR) return 'SERVER_ERROR'
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
