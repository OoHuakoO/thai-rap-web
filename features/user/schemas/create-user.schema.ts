import { z } from 'zod';
import { ROLES } from '@/types/auth.types';
import { CREATE_USER_VALIDATION_MESSAGES } from '../constants/create-user-form.constants';

// SUPER_ADMIN is deliberately absent — a second super admin is provisioned by
// the API, never created through this form.
export const USER_ROLES = [
  ROLES.ADMIN,
  ROLES.ASSESSOR,
  ROLES.MENTOR,
  ROLES.ENTREPRENEUR,
  ROLES.JUDGE,
  ROLES.ME_TEAM,
  ROLES.VIEWER,
] as const;

const PHONE_PATTERN = /^\d{9,10}$/;

export const createUserSchema = z.object({
  name: z.string().min(2, CREATE_USER_VALIDATION_MESSAGES.nameMin),
  email: z.string().email(CREATE_USER_VALIDATION_MESSAGES.emailInvalid),
  role: z.enum(USER_ROLES),
  phone: z
    .union([z.string().regex(PHONE_PATTERN, CREATE_USER_VALIDATION_MESSAGES.phoneInvalid), z.literal('')])
    .optional(),
  organization: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
