/**
 * `aiAnalysis` arrives as a single string (OpenAPI models it as `string`) but
 * the design renders it as bullets — one per line. Blank lines are dropped so
 * a trailing newline doesn't produce an empty bullet.
 */
export function toBulletLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
