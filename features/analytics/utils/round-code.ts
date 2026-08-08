/**
 * Keeps just the round code from a label that may carry a parenthesised
 * qualifier, for places that need it bare — like a card heading, which would
 * otherwise nest parentheses.
 */
export function toRoundCode(axisLabel: string | undefined): string {
  if (!axisLabel) return '';
  return axisLabel.split('(')[0].trim();
}
