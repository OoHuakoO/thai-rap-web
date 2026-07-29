import { z } from 'zod';
import { AUTH_VALIDATION_MESSAGES, OTP_LENGTH } from '../constants/auth-form.constants';

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email(AUTH_VALIDATION_MESSAGES.emailInvalid),
});

export const forgotPasswordOtpSchema = z.object({
  otp: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), AUTH_VALIDATION_MESSAGES.otpLength),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, AUTH_VALIDATION_MESSAGES.registerPasswordMin),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_VALIDATION_MESSAGES.passwordMismatch,
    path: ['confirmPassword'],
  });

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;
export type ForgotPasswordOtpValues = z.infer<typeof forgotPasswordOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
