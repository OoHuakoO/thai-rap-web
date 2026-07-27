'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TOP20_TEXT } from '../constants/dashboard-text.constants';
import type { Top20Entry } from '../types/dashboard.types';

export const TOP20_COLUMN_COUNT = 5;

interface Top20TableProps {
  entries: Top20Entry[] | undefined;
  canOpenStore: boolean;
  onRowClick: (storeId: string) => void;
}

export function Top20Table({ entries, canOpenStore, onRowClick }: Top20TableProps) {
  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-card">
        <TableRow>
          <TableHead className="w-14 text-xs">{TOP20_TEXT.rankColumn}</TableHead>
          <TableHead className="whitespace-nowrap text-xs">{TOP20_TEXT.storeNameColumn}</TableHead>
          <TableHead className="whitespace-nowrap text-xs">{TOP20_TEXT.provinceColumn}</TableHead>
          <TableHead className="whitespace-nowrap text-xs">{TOP20_TEXT.storeTypeColumn}</TableHead>
          <TableHead className="whitespace-nowrap text-right text-xs">
            {TOP20_TEXT.scoreColumn}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries?.length ? (
          entries.map((entry) => (
            <TableRow
              key={entry.storeId}
              tabIndex={canOpenStore ? 0 : undefined}
              className={canOpenStore ? 'cursor-pointer' : undefined}
              onClick={() => onRowClick(entry.storeId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onRowClick(entry.storeId);
              }}
            >
              <TableCell className="py-2 text-xs font-medium tabular-nums text-orange">
                {entry.rank}
              </TableCell>
              <TableCell className="whitespace-nowrap py-2 text-xs font-medium text-text-main">
                {entry.storeName}
              </TableCell>
              <TableCell className="whitespace-nowrap py-2 text-xs text-charcoal">
                {entry.province}
              </TableCell>
              <TableCell className="whitespace-nowrap py-2 text-xs text-charcoal">
                {entry.storeType}
              </TableCell>
              <TableCell className="py-2 text-right text-xs font-semibold tabular-nums text-text-main">
                {entry.t1Score.toFixed(2)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={TOP20_COLUMN_COUNT}
              className="py-10 text-center text-xs text-charcoal"
            >
              {TOP20_TEXT.empty}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
