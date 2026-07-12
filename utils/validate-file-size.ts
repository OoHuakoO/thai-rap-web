import { formatFileSize } from './format-file-size';

// Confirm actual limit with backend — not enforced server-side yet either.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function fileTooLargeMessage(file: File): string {
  return `ไฟล์ "${file.name}" ใหญ่เกินไป (สูงสุด ${formatFileSize(MAX_FILE_SIZE_BYTES)})`;
}
