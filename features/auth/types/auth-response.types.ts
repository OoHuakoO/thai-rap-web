import type { AuthUser, Role, ROLES } from '@/types/auth.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  // Self-registration covers every role except ADMIN and SUPER_ADMIN, which an
  // admin provisions. Keep in sync with REGISTERABLE_ROLES
  // (features/auth/schemas/register.schema.ts).
  role: Exclude<Role, typeof ROLES.ADMIN | typeof ROLES.SUPER_ADMIN>;
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
