import type { AuthUser, ROLES } from '@/types/auth.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  // Self-registration is limited to these two roles — ADMIN, MENTOR, JUDGE,
  // and ME_TEAM accounts are provisioned by an admin, never through this form.
  role: typeof ROLES.ENTREPRENEUR | typeof ROLES.ASSESSOR;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;
