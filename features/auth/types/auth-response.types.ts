import type { AuthUser, Role } from '@/types/auth.types'

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  role: Exclude<Role, 'ADMIN'>
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

export type LoginResponse = AuthResponse
export type RegisterResponse = AuthResponse
