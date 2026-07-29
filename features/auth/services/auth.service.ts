import api from '@/services/api';
import type {
  ForgotPasswordDto,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  ResetPasswordDto,
  VerifyOtpDto,
  VerifyOtpResponse,
} from '../types/auth-response.types';

export const authService = {
  login: (data: LoginDto) => api.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  register: (data: RegisterDto) =>
    api.post<RegisterResponse>('/auth/register', data).then((res) => res.data),

  logout: () => api.post<void>('/auth/logout').then((res) => res.data),

  forgotPassword: (data: ForgotPasswordDto) =>
    api.post<null>('/auth/forgot-password', data).then((res) => res.data),

  verifyOtp: (data: VerifyOtpDto) =>
    api.post<VerifyOtpResponse>('/auth/verify-otp', data).then((res) => res.data),

  resetPassword: (data: ResetPasswordDto) =>
    api.post<null>('/auth/reset-password', data).then((res) => res.data),
};
