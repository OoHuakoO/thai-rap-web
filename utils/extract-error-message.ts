import type { AxiosError } from 'axios'
import { ApiError } from '@/services/api-error'
import type { ApiErrorResponse } from '@/types/api.types'

export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message

  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    if (axiosError.response?.data?.error?.message) {
      return axiosError.response.data.error.message
    }
    return error.message
  }

  return 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
}
