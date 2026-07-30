import { colors } from '@/styles/tokens';

// 3 × 13 covers the longest dimension name in the project's set
// ("เครือข่าย วัตถุดิบ และห่วงโซ่อุปทาน") including its "7. " prefix. A larger
// font needs a narrower line to stay inside the card, so it asks for more of
// them — the product of the two is what has to keep covering the longest name.
const DEFAULT_MAX_CHARS_PER_LINE = 13;
const DEFAULT_MAX_LINES = 3;
const DEFAULT_LINE_HEIGHT = 9;
const DEFAULT_FONT_SIZE = 8;
const ELLIPSIS = '…';

/**
 * Wraps a Thai dimension name onto at most two lines. Thai has no word spaces,
 * so this breaks on character count rather than whitespace — good enough for an
 * axis label, and the full name is still listed under the bar chart.
 */
export function wrapAxisLabel(
  label: string,
  maxCharsPerLine: number = DEFAULT_MAX_CHARS_PER_LINE,
  maxLines: number = DEFAULT_MAX_LINES
): string[] {
  const lines: string[] = [];
  let rest = label;

  while (rest.length > 0 && lines.length < maxLines) {
    lines.push(rest.slice(0, maxCharsPerLine));
    rest = rest.slice(maxCharsPerLine);
  }

  if (rest.length > 0 && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = `${last.slice(0, maxCharsPerLine - 1)}${ELLIPSIS}`;
  }

  return lines;
}

type TextAnchor = 'start' | 'middle' | 'end' | 'inherit';

interface RadarAxisTickProps {
  x?: number;
  y?: number;
  textAnchor?: TextAnchor;
  payload?: { value?: string };
  /** Set by the card from its scale; Recharts clones the element and keeps it. */
  fontSize?: number;
  lineHeight?: number;
  maxCharsPerLine?: number;
  maxLines?: number;
}

export function RadarAxisTick({
  x = 0,
  y = 0,
  textAnchor,
  payload,
  fontSize = DEFAULT_FONT_SIZE,
  lineHeight = DEFAULT_LINE_HEIGHT,
  maxCharsPerLine,
  maxLines,
}: RadarAxisTickProps) {
  const lines = wrapAxisLabel(payload?.value ?? '', maxCharsPerLine, maxLines);

  return (
    <text x={x} y={y} textAnchor={textAnchor} fill={colors.charcoal} fontSize={fontSize}>
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
