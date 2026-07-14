import { z } from 'zod';
import { ROLES } from '@/types/auth.types';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth-form.constants';

export const REGISTERABLE_ROLES = [ROLES.ENTREPRENEUR, ROLES.ASSESSOR] as const;

export const registerSchema = z
  .object({
    name: z.string().min(2, AUTH_VALIDATION_MESSAGES.nameMin),
    email: z.string().email(AUTH_VALIDATION_MESSAGES.emailInvalid),
    password: z.string().min(8, AUTH_VALIDATION_MESSAGES.registerPasswordMin),
    confirmPassword: z.string(),
    role: z.enum(REGISTERABLE_ROLES, {
      errorMap: () => ({ message: AUTH_VALIDATION_MESSAGES.roleRequired }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_VALIDATION_MESSAGES.passwordMismatch,
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
