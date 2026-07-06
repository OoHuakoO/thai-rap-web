import api from '@/services/api'
import type { LoginDto, LoginResponse, RegisterDto, RegisterResponse } from '../types/auth-response.types'

export const authService = {
  login: (data: LoginDto) =>
    api.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  register: (data: RegisterDto) =>
    api.post<RegisterResponse>('/auth/register', data).then((res) => res.data),
}
