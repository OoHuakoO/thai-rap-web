import { toast } from 'sonner';
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size';

export function filterValidFiles(files: File[]): File[] {
  const valid: File[] = [];
  for (const file of files) {
    if (isFileSizeValid(file)) {
      valid.push(file);
    } else {
      toast.error(fileTooLargeMessage(file));
    }
  }
  return valid;
}
