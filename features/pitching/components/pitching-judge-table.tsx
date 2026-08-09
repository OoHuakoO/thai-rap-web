'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Badge } from '@/components/ui/badge';
import type { TableColumn } from '@/types';
import { formatThaiDate, formatThaiDateTime } from '@/utils/format-thai-date';
import {
  PITCHING_DASHBOARD_TEXT,
  PITCHING_JUDGE_TABLE_PAGE_LIMIT,
  PITCHING_RECOMMENDATION_BADGE_CLASSES,
  PITCHING_RECOMMENDATION_LABELS,
  PITCHING_STATUS_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { Pitching } from '../types/pitching.types';
import { PitchingPanel } from './pitching-panel';

interface PitchingJudgeTableProps {
  judges: Pitching[];
}

/**
 * The store report answers every judge in one payload, so the page slice is cut
 * here rather than asked for — there is no per-judge endpoint to page against.
 */
export function PitchingJudgeTable({ judges }: PitchingJudgeTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PITCHING_JUDGE_TABLE_PAGE_LIMIT);

  const totalPages = Math.max(1, Math.ceil(judges.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = judges.slice((currentPage - 1) * limit, currentPage * limit);

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
          <Badge
            variant="outline"
            className={PITCHING_RECOMMENDATION_BADGE_CLASSES[row.recommendation]}
          >
            {PITCHING_RECOMMENDATION_LABELS[row.recommendation]}
          </Badge>
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
      {judges.length > 0 && (
        <PaginationBar
          page={currentPage}
          limit={limit}
          total={judges.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
          itemLabel={PITCHING_DASHBOARD_TEXT.judgeTableItemLabel}
        />
      )}
    </PitchingPanel>
  );
}
