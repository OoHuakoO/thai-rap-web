export function formatThaiDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "18 พ.ค. 2569 10:30 น." — date plus 24-hour clock, as the design shows. */
export function formatThaiDateTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const time = date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${formatThaiDate(iso)} ${time} น.`;
}
