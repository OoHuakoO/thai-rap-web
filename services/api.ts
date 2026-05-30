import axios from 'axios'
import { toast } from 'sonner'
import { API_URL, API_TIMEOUT_MS } from '@/constants'
import { ROUTES } from '@/constants/routes'
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
        const { state } = JSON.parse(raw) as { state: { token?: string } }
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      }
    } catch {
      // storage unavailable or malformed — proceed without token
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = mapToApiError(error)

    if (apiError.isCancelled) return Promise.reject(apiError)

    if (apiError.isNetworkError) {
      toast.error(apiError.message, { id: 'network-error' })
      return Promise.reject(apiError)
    }

    if (typeof window !== 'undefined') {
      switch (apiError.statusCode) {
        case 401:
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
