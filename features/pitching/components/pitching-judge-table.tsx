'use client';

import { Users } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Badge } from '@/components/ui/badge';
import type { TableColumn } from '@/types';
import { formatThaiDate, formatThaiDateTime } from '@/utils/format-thai-date';
import {
  PITCHING_DASHBOARD_TEXT,
  PITCHING_JUDGE_TABLE_PAGE_LIMIT,
  PITCHING_STATUS_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { usePagedRows } from '../hooks/use-paged-rows';
import type { Pitching } from '../types/pitching.types';
import { PitchingPanel } from './pitching-panel';
import { PitchingRecommendationBadge } from './pitching-recommendation-badge';

interface PitchingJudgeTableProps {
  judges: Pitching[];
}

/**
 * The store report answers every judge in one payload, so the page slice is cut
 * here rather than asked for — there is no per-judge endpoint to page against.
 */
export function PitchingJudgeTable({ judges }: PitchingJudgeTableProps) {
  const { pageRows, page, limit, total, totalPages, setPage, setLimit } = usePagedRows(
    judges,
    PITCHING_JUDGE_TABLE_PAGE_LIMIT
  );

  const columns: TableColumn<Pitching>[] = [
    {
      key: 'id',
      header: PITCHING_DASHBOARD_TEXT.judgeIndexColumn,
      className: 'w-10',
      cell: (row) => judges.indexOf(row) + 1,
    },
    // Titles run long ("ผศ.ดร.…"), so the name wraps rather than holding a
    // 180px column and pushing สถานะ off the card.
    { key: 'judgeName', header: PITCHING_DASHBOARD_TEXT.judgeNameColumn },
    {
      key: 'totalScore',
      header: PITCHING_DASHBOARD_TEXT.judgeTotalColumn,
      // Left to wrap on purpose: "คะแนนรวม (เต็ม 100)" held on one line pushes
      // the last two columns out of the card.
      className: 'w-24',
      cell: (row) => (
        <span className="font-semibold tabular-nums text-orange">
          {row.totalScore ?? PITCHING_TEXT.noComment}
        </span>
      ),
    },
    {
      key: 'evaluatedAt',
      header: PITCHING_DASHBOARD_TEXT.judgeEvaluatedAtColumn,
      className: 'whitespace-nowrap',
      // The clock time is on the tooltip, not in the cell — the exact minute a
      // form was filled decides nothing, and it costs the column 70px.
      cell: (row) => (
        <span title={formatThaiDateTime(row.evaluatedAt)}>
          {formatThaiDate(row.evaluatedAt) || PITCHING_TEXT.noComment}
        </span>
      ),
    },
    {
      key: 'recommendationReason',
      header: PITCHING_DASHBOARD_TEXT.judgeNoteColumn,
      // เหตุผลประกอบการพิจารณา is a free-text paragraph on the form. Left to wrap
      // it makes a row five lines tall and the card outgrows the two beside it,
      // so the cell caps it and hands the rest to the title tooltip.
      // The cap sits on the span, not the cell: an auto-layout table ignores
      // max-width on a <td>, so the column would size to the whole paragraph.
      cell: (row) => (
        <span
          className="line-clamp-2 max-w-[10rem] text-muted-foreground"
          title={row.recommendationReason ?? undefined}
        >
          {row.recommendationReason || PITCHING_TEXT.noComment}
        </span>
      ),
    },
    {
      key: 'status',
      header: PITCHING_DASHBOARD_TEXT.judgeStatusColumn,
      className: 'whitespace-nowrap',
      // A submitted form is named by its verdict; a draft has none yet, so it
      // falls back to the form's own status rather than rendering an empty cell.
      cell: (row) =>
        row.recommendation ? (
          <PitchingRecommendationBadge recommendation={row.recommendation} />
        ) : (
          <Badge variant="outline">{PITCHING_STATUS_LABELS[row.status]}</Badge>
        ),
    },
  ];

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.judgeTableTitle}
      icon={Users}
      accent="charcoal"
      contentClassName="gap-4"
    >
      <div className="flex-1">
        <DataTable
          columns={columns}
          data={pageRows}
          keyField="id"
          emptyMessage={PITCHING_DASHBOARD_TEXT.judgeTableEmpty}
        />
      </div>
      {total > 0 && (
        <PaginationBar
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          itemLabel={PITCHING_DASHBOARD_TEXT.judgeTableItemLabel}
        />
      )}
    </PitchingPanel>
  );
}
