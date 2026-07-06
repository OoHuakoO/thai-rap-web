import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { API_URL, API_TIMEOUT_MS } from '@/constants'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import type { AuthTokens } from '@/features/auth/types/auth-response.types'
import { mapToApiError } from './error-mapper'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT_MS,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const { state } = JSON.parse(raw) as { state: { accessToken?: string } }
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`
        }
      }
    } catch {
      // storage unavailable or malformed — proceed without token
    }
  }
  return config
})

// The backend wraps every success response as { success: true, data }. Unwrap
// it here so every service's `.then((res) => res.data)` keeps getting the real
// payload, instead of every call site unwrapping twice. Mocks return flat
// payloads directly (no `success` key), so they pass through untouched.
api.interceptors.response.use((response) => {
  const body = response.data as Record<string, unknown> | null
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = body.data
  }
  return response
})

const AUTH_ENDPOINTS_WITHOUT_RETRY = ['/auth/login', '/auth/register', '/auth/refresh']

function isAuthEndpointWithoutRetry(url?: string): boolean {
  return !!url && AUTH_ENDPOINTS_WITHOUT_RETRY.some((path) => url.includes(path))
}

let refreshPromise: Promise<string | null> | null = null

async function doRefreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) return null

  try {
    const res = await axios.post<{ success: boolean; data: AuthTokens }>(
      `${API_URL}/auth/refresh`,
      { refreshToken }
    )
    const tokens = res.data.data
    useAuthStore.getState().setTokens(tokens)
    return tokens.accessToken
  } catch {
    return null
  }
}

// Concurrent 401s share a single in-flight refresh call instead of each
// triggering their own POST /auth/refresh.
function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = mapToApiError(error)

    if (apiError.isCancelled) return Promise.reject(apiError)

    if (apiError.isNetworkError) {
      toast.error(apiError.message, { id: 'network-error' })
      return Promise.reject(apiError)
    }

    const originalRequest = axios.isAxiosError(error)
      ? (error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined)
      : undefined

    if (
      apiError.statusCode === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpointWithoutRetry(originalRequest.url)
    ) {
      originalRequest._retry = true
      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      }
    }

    if (typeof window !== 'undefined') {
      switch (apiError.statusCode) {
        case 401:
          useAuthStore.getState().logout()
          localStorage.removeItem('auth-storage')
          window.location.href = `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(window.location.pathname)}`
          break

        case 403:
          window.location.href = ROUTES.ERROR_403
          break

        case 429: {
          const seconds = apiError.retryAfter
          const msg = seconds
            ? `คำขอมากเกินไป กรุณาลองอีกครั้งใน ${seconds} วินาที`
            : 'คำขอมากเกินไป กรุณาลองอีกครั้งในอีกสักครู่'
          toast.warning(msg, { id: 'rate-limit' })
          break
        }

        case 500:
        case 502:
        case 504:
          window.location.href = ROUTES.ERROR_500
          break

        case 503:
          window.location.href = ROUTES.ERROR_503
          break
      }
    }

    return Promise.reject(apiError)
  }
)

export default api
