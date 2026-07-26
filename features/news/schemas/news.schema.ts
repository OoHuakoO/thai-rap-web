import { z } from 'zod';
import {
  NEWS_DESCRIPTION_MAX_LENGTH,
  NEWS_TITLE_MAX_LENGTH,
  NEWS_VALIDATION_MESSAGES,
} from '../constants/news.constants';

export const newsFormSchema = z.object({
  type: z.enum(['GENERAL', 'EVENT', 'ALERT'], {
    required_error: NEWS_VALIDATION_MESSAGES.typeRequired,
  }),
  title: z
    .string()
    .min(1, NEWS_VALIDATION_MESSAGES.titleRequired)
    .max(NEWS_TITLE_MAX_LENGTH, NEWS_VALIDATION_MESSAGES.titleTooLong),
  description: z
    .string()
    .min(1, NEWS_VALIDATION_MESSAGES.descriptionRequired)
    .max(NEWS_DESCRIPTION_MAX_LENGTH, NEWS_VALIDATION_MESSAGES.descriptionTooLong),
  urgent: z.boolean(),
});

export type NewsFormValues = z.infer<typeof newsFormSchema>;
