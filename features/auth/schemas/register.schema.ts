import { z } from 'zod';
import { ROLES } from '@/types/auth.types';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth-form.constants';

// VIEWER is the default self-service level — anyone may sign up to browse the
// disclosed data. Staff levels (MENTOR/ADMIN/…) are created by an admin instead.
export const REGISTERABLE_ROLES = [ROLES.VIEWER, ROLES.ENTREPRENEUR, ROLES.ASSESSOR] as const;

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
