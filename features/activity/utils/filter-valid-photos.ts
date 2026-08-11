import { toast } from 'sonner';
import { fileTooLargeMessage, isFileSizeValid } from '@/utils/validate-file-size';
import { ACTIVITY_FORM_TEXT, ACTIVITY_PHOTO_MAX_PER_UPLOAD } from '../constants/activity.constants';

/**
 * Drops what the API would reject anyway: an oversized file, and anything past
 * the per-request cap that `FilesInterceptor` silently truncates. Both kinds are
 * reported — a file that disappears from the selection with no message reads as
 * a broken picker.
 *
 * @param alreadySelected photos the caller is already holding, so the cap counts
 *   the whole selection rather than one batch of it.
 */
export function filterValidPhotos(files: File[], alreadySelected = 0): File[] {
  const room = Math.max(0, ACTIVITY_PHOTO_MAX_PER_UPLOAD - alreadySelected);
  const valid: File[] = [];
  let skipped = 0;

  for (const file of files) {
    // The cap is checked first so a file past it is reported once, as over the
    // limit, rather than also being measured against a limit it never reaches.
    if (valid.length >= room) {
      skipped += 1;
      continue;
    }
    if (!isFileSizeValid(file)) {
      toast.error(fileTooLargeMessage(file));
      continue;
    }
    valid.push(file);
  }

  if (skipped > 0) toast.error(ACTIVITY_FORM_TEXT.photoLimitExceeded(skipped));
  return valid;
}
