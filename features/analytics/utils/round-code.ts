/**
 * Trend axis labels are round codes with an optional qualifier —
 * "T3 (เป้าหมาย)". Keeps just the code for places that need it bare, like the
 * card heading, which would otherwise nest parentheses.
 */
export function toRoundCode(axisLabel: string | undefined): string {
  if (!axisLabel) return '';
  return axisLabel.split('(')[0].trim();
}
