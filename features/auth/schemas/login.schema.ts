import { z } from 'zod';
import { AUTH_VALIDATION_MESSAGES } from '../constants/auth-form.constants';

export const loginSchema = z.object({
  email: z.string().email(AUTH_VALIDATION_MESSAGES.emailInvalid),
  password: z.string().min(6, AUTH_VALIDATION_MESSAGES.loginPasswordMin),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
