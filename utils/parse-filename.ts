const FILENAME_PATTERN = /filename="?([^";]+)"?/;

/**
 * The filename a download endpoint names itself in its `content-disposition`
 * header. The server owns the format — the mock ships CSV where the real API
 * ships XLSX — so the name is read off the response rather than built here.
 *
 * Takes `unknown` because axios types response headers loosely; a header that
 * is absent or non-string yields `undefined`, and the caller falls back.
 */
export function parseFilename(contentDisposition: unknown): string | undefined {
  if (typeof contentDisposition !== 'string') return undefined;
  return FILENAME_PATTERN.exec(contentDisposition)?.[1];
}
