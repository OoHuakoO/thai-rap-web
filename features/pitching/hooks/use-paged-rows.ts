import { useState } from 'react';

interface PagedRows<T> {
  /** The slice to render — already clamped to a page that exists. */
  pageRows: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  /** Changing the page size restarts at page 1, as every table here does. */
  setLimit: (limit: number) => void;
}

/**
 * Client-side paging for rows the caller already holds. Both surfaces using it
 * are handed a whole payload by one query — the store report answers every
 * judge at once, the dashboard the whole cohort — so there is no endpoint to
 * page against and the slice is cut here.
 *
 * The page is clamped on read rather than reset in an effect: rows can shrink
 * under an open view (a round switched behind the ranking dialog), and a
 * derived clamp renders the last page that exists without a second pass.
 */
export function usePagedRows<T>(rows: T[], initialLimit: number): PagedRows<T> {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);

  return {
    pageRows: rows.slice((currentPage - 1) * limit, currentPage * limit),
    page: currentPage,
    limit,
    total,
    totalPages,
    setPage,
    setLimit: (next: number) => {
      setLimit(next);
      setPage(1);
    },
  };
}
