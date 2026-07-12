// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  orange: '#F17128',      // primary CTA, active nav
  orangeLight: '#F58544', // hover states, secondary CTA
  orangeDark: '#C75B1A',  // project banner title
  cream: '#FFF0E5',       // tinted backgrounds, highlights
  creamSoft: '#FDF5EC',   // project banner gradient start
  creamLight: '#FFF8F2',  // project banner gradient end
  charcoal: '#58595B',    // body text, secondary labels
  white: '#FFFFFF',       // page background, card bg
  purple: '#7C3AED',      // secondary badges
  purpleBanner: '#7A51A0', // project banner heading text (matches design)
  darkNav: '#1F2937',     // sidebar bg
  textMain: '#111827',    // body text
  scoreGreen: '#10B981',  // positive score
  scoreRed: '#EF4444',    // negative score / error
} as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────

export const fontSizes = {
  xs: '0.75rem',    // 12px — captions, labels
  sm: '0.875rem',   // 14px — secondary text, table rows
  base: '1rem',     // 16px — body text
  lg: '1.125rem',   // 18px — subheadings
  xl: '1.25rem',    // 20px — card titles
  '2xl': '1.5rem',  // 24px — section headings
  '3xl': '1.875rem', // 30px — page headings
  '4xl': '2.25rem', // 36px — hero headings
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
// Based on 4px base unit — matches Tailwind's default scale

export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
  none: 'none',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',   // 4px  — inputs, small elements
  md: '0.375rem',  // 6px  — buttons
  lg: '0.5rem',    // 8px  — cards (matches --radius in globals.css)
  xl: '0.75rem',   // 12px — modals, large panels
  '2xl': '1rem',   // 16px — hero sections
  full: '9999px',  // pills, badges, avatars
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

// Default color palette for Recharts series — ordered by visual priority
export const chartColors = [
  '#3B82F6', // blue-500   — primary series
  '#10B981', // emerald-500 — secondary series (= scoreGreen)
  '#F59E0B', // amber-500  — tertiary series
  '#EF4444', // red-500    — quaternary series (= scoreRed)
] as const;

export type ColorToken = keyof typeof colors;
export type FontSizeToken = keyof typeof fontSizes;
export type SpacingToken = keyof typeof spacing;
export type ShadowToken = keyof typeof shadows;
export type BorderRadiusToken = keyof typeof borderRadius;
