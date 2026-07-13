import { MAX_FILE_SIZE_BYTES } from '@/constants';
import { formatFileSize } from './format-file-size';

export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function fileTooLargeMessage(file: File): string {
  return `ไฟล์ "${file.name}" ใหญ่เกินไป (สูงสุด ${formatFileSize(MAX_FILE_SIZE_BYTES)})`;
}
