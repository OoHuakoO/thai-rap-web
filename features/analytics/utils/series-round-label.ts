import { toRoundCode } from './round-code';

const PAIR_SEPARATOR = ' vs ';
const RANGE_SEPARATOR = ' – ';

/** Up to this many rounds are listed one by one; more read better as a range. */
const MAX_LISTED_ROUNDS = 2;

/**
 * Names the rounds a chart is plotting, for its heading: "T0 vs T1" for a pair,
 * "T0 – T3" once the whole funnel is on screen. Series names carry a qualifier
 * in mock mode ("T0 (เริ่มต้น)") that the heading doesn't want, hence the
 * round-code strip.
 */
export function formatSeriesRoundLabel(seriesNames: string[]): string {
  const codes = seriesNames.map(toRoundCode).filter(Boolean);
  if (codes.length === 0) return '';
  if (codes.length <= MAX_LISTED_ROUNDS) return codes.join(PAIR_SEPARATOR);
  return `${codes[0]}${RANGE_SEPARATOR}${codes[codes.length - 1]}`;
}
