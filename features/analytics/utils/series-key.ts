/**
 * Recharts `dataKey`s become CSS custom property names (`--color-<key>`), so
 * they must be stable identifiers. Series names arrive from the API as Thai
 * display strings ("T0 (เริ่มต้น)"), which are not — key by position instead.
 */
export function toSeriesKey(index: number): string {
  return `series${index}`;
}
