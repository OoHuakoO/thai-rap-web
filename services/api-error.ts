export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CANCELLED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN'

interface ApiErrorParams {
  message: string
  statusCode: number
  code: ErrorCode
  details?: Record<string, string[]>
  requestId?: string
  isNetworkError?: boolean
  isCancelled?: boolean
  retryAfter?: number
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode
  readonly details?: Record<string, string[]>
  readonly requestId?: string
  readonly isNetworkError: boolean
  readonly isCancelled: boolean
  readonly retryAfter?: number

  constructor({
    message,
    statusCode,
    code,
    details,
    requestId,
    isNetworkError = false,
    isCancelled = false,
    retryAfter,
  }: ApiErrorParams) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.requestId = requestId
    this.isNetworkError = isNetworkError
    this.isCancelled = isCancelled
    this.retryAfter = retryAfter
    // Maintain prototype chain for instanceof checks across transpilation targets
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
