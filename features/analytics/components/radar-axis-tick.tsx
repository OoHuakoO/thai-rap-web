import { colors } from '@/styles/tokens';

// 3 × 13 covers the longest dimension name in the project's set
// ("เครือข่าย วัตถุดิบ และห่วงโซ่อุปทาน") including its "7. " prefix.
const MAX_CHARS_PER_LINE = 13;
const MAX_LINES = 3;
const LINE_HEIGHT = 9;
const FONT_SIZE = 8;
const ELLIPSIS = '…';

/**
 * Wraps a Thai dimension name onto at most two lines. Thai has no word spaces,
 * so this breaks on character count rather than whitespace — good enough for an
 * axis label, and the full name is still listed under the bar chart.
 */
export function wrapAxisLabel(label: string): string[] {
  const lines: string[] = [];
  let rest = label;

  while (rest.length > 0 && lines.length < MAX_LINES) {
    lines.push(rest.slice(0, MAX_CHARS_PER_LINE));
    rest = rest.slice(MAX_CHARS_PER_LINE);
  }

  if (rest.length > 0 && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = `${last.slice(0, MAX_CHARS_PER_LINE - 1)}${ELLIPSIS}`;
  }

  return lines;
}

type TextAnchor = 'start' | 'middle' | 'end' | 'inherit';

interface RadarAxisTickProps {
  x?: number;
  y?: number;
  textAnchor?: TextAnchor;
  payload?: { value?: string };
}

export function RadarAxisTick({ x = 0, y = 0, textAnchor, payload }: RadarAxisTickProps) {
  const lines = wrapAxisLabel(payload?.value ?? '');

  return (
    <text x={x} y={y} textAnchor={textAnchor} fill={colors.charcoal} fontSize={FONT_SIZE}>
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 0 : LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
