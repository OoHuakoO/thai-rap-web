export function formatThaiDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
