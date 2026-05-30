import type { AuthUser } from '@/types/auth.types'

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
}
