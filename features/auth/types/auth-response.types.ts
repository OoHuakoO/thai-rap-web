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

// Registration returns no session. The API creates the account as PENDING and
// login rejects that status (403 AUTH_006), so there is nothing to sign in
// with until a SUPER_ADMIN approves it on /users.
export interface RegisterResponse {
  user: AuthUser;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

// The OTP is traded for this token, and reset-password accepts nothing else —
// the code itself never goes over the wire twice.
export interface VerifyOtpResponse {
  resetToken: string;
  expiresIn: number;
}

export interface ResetPasswordDto {
  resetToken: string;
  password: string;
}
