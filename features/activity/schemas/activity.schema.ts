import { z } from 'zod';
import {
  ACTIVITY_DESCRIPTION_MAX_LENGTH,
  ACTIVITY_LOCATION_MAX_LENGTH,
  ACTIVITY_NOTE_MAX_LENGTH,
  ACTIVITY_TITLE_MAX_LENGTH,
  ACTIVITY_VALIDATION_MESSAGES,
} from '../constants/activity.constants';

export const activityFormSchema = z.object({
  title: z
    .string()
    .min(1, ACTIVITY_VALIDATION_MESSAGES.titleRequired)
    .max(ACTIVITY_TITLE_MAX_LENGTH, ACTIVITY_VALIDATION_MESSAGES.titleTooLong),
  description: z
    .string()
    .min(1, ACTIVITY_VALIDATION_MESSAGES.descriptionRequired)
    .max(ACTIVITY_DESCRIPTION_MAX_LENGTH, ACTIVITY_VALIDATION_MESSAGES.descriptionTooLong),
  // The date input hands back 'YYYY-MM-DD'; the service widens it to the ISO
  // string the API's @IsDateString expects.
  activityDate: z.string().min(1, ACTIVITY_VALIDATION_MESSAGES.activityDateRequired),
  location: z
    .string()
    .max(ACTIVITY_LOCATION_MAX_LENGTH, ACTIVITY_VALIDATION_MESSAGES.locationTooLong),
  note: z.string().max(ACTIVITY_NOTE_MAX_LENGTH, ACTIVITY_VALIDATION_MESSAGES.noteTooLong),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
