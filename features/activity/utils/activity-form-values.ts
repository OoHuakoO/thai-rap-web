import type { ActivityFormValues } from '../schemas/activity.schema';
import type { Activity, CreateActivityDto } from '../types/activity.types';

/** `<input type="date">` reads and writes 'YYYY-MM-DD'; the API sends a full ISO timestamp. */
export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function toActivityFormValues(activity?: Activity): ActivityFormValues {
  return {
    title: activity?.title ?? '',
    description: activity?.description ?? '',
    activityDate: activity ? toDateInputValue(activity.activityDate) : '',
    location: activity?.location ?? '',
    note: activity?.note ?? '',
  };
}

/**
 * An optional field cleared in the form is sent as an empty string, not dropped —
 * omitting it on a PATCH would leave the old value in place, which is the
 * opposite of what clearing the box means.
 */
export function toActivityDto(values: ActivityFormValues): CreateActivityDto {
  return {
    title: values.title,
    description: values.description,
    activityDate: new Date(values.activityDate).toISOString(),
    location: values.location,
    note: values.note,
  };
}
