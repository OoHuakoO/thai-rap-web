// Run with: npx vitest (requires vitest + @testing-library setup from Sprint 8)
import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { ApiError } from '../api-error'
import { mapToApiError } from '../error-mapper'

describe('ApiError', () => {
  it('instanceof check works across transpilation', () => {
    const err = new ApiError({ message: 'fail', statusCode: 500, code: 'SERVER_ERROR' })
    expect(err instanceof ApiError).toBe(true)
    expect(err instanceof Error).toBe(true)
  })

  it('name is ApiError', () => {
    const err = new ApiError({ message: 'fail', statusCode: 500, code: 'SERVER_ERROR' })
    expect(err.name).toBe('ApiError')
  })

  it('exposes all fields', () => {
    const err = new ApiError({
      message: 'Too many requests',
      statusCode: 429,
      code: 'RATE_LIMITED',
      retryAfter: 30,
      requestId: 'req-123',
    })
    expect(err.statusCode).toBe(429)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.retryAfter).toBe(30)
    expect(err.requestId).toBe('req-123')
    expect(err.isNetworkError).toBe(false)
    expect(err.isCancelled).toBe(false)
  })
})

describe('mapToApiError', () => {
  it('maps cancelled request', () => {
    const cancelToken = new axios.CancelToken(() => {})
    const cancel = axios.CancelToken.source()
    cancel.cancel('user cancelled')
    // axios.isCancel check
    const err = mapToApiError(new axios.Cancel('user cancelled'))
    expect(err.code).toBe('CANCELLED')
    expect(err.isCancelled).toBe(true)
  })

  it('maps network error (no response)', () => {
    const axiosErr = new axios.AxiosError('Network Error', 'ERR_NETWORK')
    const err = mapToApiError(axiosErr)
    expect(err.code).toBe('NETWORK_ERROR')
    expect(err.isNetworkError).toBe(true)
  })

  it('maps timeout error', () => {
    const axiosErr = new axios.AxiosError('timeout', 'ECONNABORTED')
    const err = mapToApiError(axiosErr)
    expect(err.code).toBe('TIMEOUT_ERROR')
    expect(err.isNetworkError).toBe(true)
  })

  it('maps 401 → UNAUTHORIZED', () => {
    const axiosErr = new axios.AxiosError('Unauthorized', undefined, undefined, undefined, {
      status: 401,
      data: { message: 'Unauthorized', statusCode: 401 },
      headers: {},
      config: {} as never,
      statusText: 'Unauthorized',
    })
    const err = mapToApiError(axiosErr)
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('maps 403 → FORBIDDEN', () => {
    const axiosErr = new axios.AxiosError('Forbidden', undefined, undefined, undefined, {
      status: 403,
      data: { message: 'Forbidden', statusCode: 403 },
      headers: {},
      config: {} as never,
      statusText: 'Forbidden',
    })
    expect(mapToApiError(axiosErr).code).toBe('FORBIDDEN')
  })

  it('maps 429 with retry-after header', () => {
    const axiosErr = new axios.AxiosError('Too Many Requests', undefined, undefined, undefined, {
      status: 429,
      data: { message: 'Rate limited', statusCode: 429 },
      headers: { 'retry-after': '60' },
      config: {} as never,
      statusText: 'Too Many Requests',
    })
    const err = mapToApiError(axiosErr)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.retryAfter).toBe(60)
  })

  it('maps 500 → SERVER_ERROR', () => {
    const axiosErr = new axios.AxiosError('Server Error', undefined, undefined, undefined, {
      status: 500,
      data: { message: 'Internal server error', statusCode: 500 },
      headers: {},
      config: {} as never,
      statusText: 'Internal Server Error',
    })
    expect(mapToApiError(axiosErr).code).toBe('SERVER_ERROR')
  })

  it('maps 503 → SERVICE_UNAVAILABLE', () => {
    const axiosErr = new axios.AxiosError('Service Unavailable', undefined, undefined, undefined, {
      status: 503,
      data: { message: 'Service unavailable', statusCode: 503 },
      headers: {},
      config: {} as never,
      statusText: 'Service Unavailable',
    })
    expect(mapToApiError(axiosErr).code).toBe('SERVICE_UNAVAILABLE')
  })

  it('maps unknown Error', () => {
    const err = mapToApiError(new Error('something went wrong'))
    expect(err.code).toBe('UNKNOWN')
    expect(err.message).toBe('something went wrong')
  })

  it('maps non-Error to UNKNOWN', () => {
    const err = mapToApiError('a string error')
    expect(err.code).toBe('UNKNOWN')
  })
})
