import api from '@/services/api'
import type { LoginDto, LoginResponse } from '../types/auth-response.types'

export const authService = {
  login: (data: LoginDto) =>
    api.post<LoginResponse>('/auth/login', data).then((res) => res.data),
}
