import { z } from 'zod';
import { STORE_VALIDATION_MESSAGES } from '../constants/store-form.constants';

export const storeFormSchema = z
  .object({
    name: z.string().min(1, STORE_VALIDATION_MESSAGES.nameRequired),
    province: z.string().min(1, STORE_VALIDATION_MESSAGES.provinceRequired),
    storeType: z.string().min(1, STORE_VALIDATION_MESSAGES.storeTypeRequired),
    ownerName: z.string().min(1, STORE_VALIDATION_MESSAGES.ownerNameRequired),
    phone: z.string().min(1, STORE_VALIDATION_MESSAGES.phoneRequired),
    address: z.string().min(1, STORE_VALIDATION_MESSAGES.addressRequired),
    email: z.string().email(STORE_VALIDATION_MESSAGES.emailInvalid).optional().or(z.literal('')),
    avgRevenueMin: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), STORE_VALIDATION_MESSAGES.avgRevenueNumeric),
    avgRevenueMax: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), STORE_VALIDATION_MESSAGES.avgRevenueNumeric),
    mainProblems: z.array(z.string()).default([]),
    goals: z.array(z.string()).default([]),
    facebook: z.string().optional(),
    line: z.string().optional(),
    instagram: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.avgRevenueMin ||
      !data.avgRevenueMax ||
      Number(data.avgRevenueMax) >= Number(data.avgRevenueMin),
    { message: STORE_VALIDATION_MESSAGES.avgRevenueRange, path: ['avgRevenueMax'] }
  );

export type StoreFormValues = z.infer<typeof storeFormSchema>;
