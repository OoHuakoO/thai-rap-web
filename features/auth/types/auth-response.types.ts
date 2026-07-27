import type { AuthUser, ROLES } from '@/types/auth.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  // Self-registration is limited to these roles — every staff account (ASSESSOR,
  // MENTOR, JUDGE, ME_TEAM, ADMIN) is provisioned by an admin, never through this
  // form. Keep in sync with REGISTERABLE_ROLES (features/auth/schemas/register.schema.ts).
  role: typeof ROLES.VIEWER | typeof ROLES.ENTREPRENEUR;
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
