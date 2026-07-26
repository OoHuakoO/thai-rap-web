// Pinned to Asia/Bangkok so the "ข้อมูล ณ วันที่" footer shows the same day for
// every viewer — an ISO timestamp near midnight would otherwise render as the
// previous day for anyone in a timezone behind UTC+7.
const DATA_DATE_TIME_ZONE = 'Asia/Bangkok';

export function formatDataDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: DATA_DATE_TIME_ZONE,
  });
}

export function formatShortDataDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: DATA_DATE_TIME_ZONE,
  });
}
