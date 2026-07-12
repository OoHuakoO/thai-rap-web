import { z } from 'zod';
import { CREATE_USER_VALIDATION_MESSAGES } from '../constants/create-user-form.constants';

export const USER_ROLES = [
  'ADMIN',
  'ASSESSOR',
  'MENTOR',
  'ENTREPRENEUR',
  'JUDGE',
  'ME_TEAM',
] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, CREATE_USER_VALIDATION_MESSAGES.nameMin),
  email: z.string().email(CREATE_USER_VALIDATION_MESSAGES.emailInvalid),
  role: z.enum(USER_ROLES),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
