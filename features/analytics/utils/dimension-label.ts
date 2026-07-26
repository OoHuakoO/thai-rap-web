const LEADING_NUMBER_PATTERN = /^\s*\d+\s*[.)]\s*/;

/**
 * The API may or may not already prefix an axis label with its dimension
 * number ("1.การจัดการองค์กร" vs "การจัดการองค์กร"). Strip it so the client
 * owns the numbering and never renders "1. 1.การจัดการองค์กร".
 */
export function stripDimensionPrefix(axisLabel: string): string {
  return axisLabel.replace(LEADING_NUMBER_PATTERN, '');
}

/** "การจัดการองค์กร" at index 0 → "1. การจัดการองค์กร". */
export function toNumberedDimensionLabel(axisLabel: string, index: number): string {
  return `${index + 1}. ${stripDimensionPrefix(axisLabel)}`;
}
