import { z } from 'zod';
import { ROLES } from '@/types/auth.types';
import { CREATE_USER_VALIDATION_MESSAGES } from '../constants/create-user-form.constants';

export const USER_ROLES = [
  ROLES.ADMIN,
  ROLES.ASSESSOR,
  ROLES.MENTOR,
  ROLES.ENTREPRENEUR,
  ROLES.JUDGE,
  ROLES.ME_TEAM,
] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, CREATE_USER_VALIDATION_MESSAGES.nameMin),
  email: z.string().email(CREATE_USER_VALIDATION_MESSAGES.emailInvalid),
  role: z.enum(USER_ROLES),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
