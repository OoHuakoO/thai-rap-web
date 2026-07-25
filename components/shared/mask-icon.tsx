import { cn } from '@/utils/cn';

interface MaskIconProps {
  /** Path under `public/` to a PNG whose alpha channel is the artwork. */
  src: string;
  className?: string;
}

/**
 * Paints a PNG's alpha channel in the current text colour, so raster artwork
 * responds to Tailwind colour classes the way a lucide SVG does.
 *
 * The mask has to be an inline style rather than an arbitrary Tailwind value:
 * `src` is only known at runtime, and Tailwind can generate classes only for
 * values it can read at build time.
 */
export function MaskIcon({ src, className }: MaskIconProps) {
  const mask = `url(${src}) center / contain no-repeat`;

  return (
    <span
      aria-hidden
      className={cn('inline-block bg-current', className)}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
