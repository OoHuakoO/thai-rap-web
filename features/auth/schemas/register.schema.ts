import { z } from 'zod';
import { ROLES } from '@/types/auth.types';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth-form.constants';

// Registration activates the account immediately, so a self-registered ASSESSOR
// can score assessments on day one — accepted for now. ADMIN and SUPER_ADMIN are
// excluded: they manage users and rewrite every other role's permissions.
// Mirrors SELF_REGISTERABLE_ROLES in thai-rap-api (common/constants/role.const.ts).
export const REGISTERABLE_ROLES = [
  ROLES.VIEWER,
  ROLES.ENTREPRENEUR,
  ROLES.MENTOR,
  ROLES.ASSESSOR,
  ROLES.JUDGE,
] as const;

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
