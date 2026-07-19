export function splitFilename(filename: string): { base: string; ext: string } {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return { base: filename, ext: '' };
  return { base: filename.slice(0, lastDot), ext: filename.slice(lastDot) };
}
