'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCard } from '@/components/shared/alert-card';
import { TableSkeleton } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { DEFAULT_TOP20_ROUND, TOP20_ROUND_OPTIONS } from '../constants/dashboard-display.constants';
import { TOP20_TEXT } from '../constants/dashboard-text.constants';
import { useTop20 } from '../hooks/use-top20';
import type { Top20RoundFilter } from '../types/dashboard.types';
import { CardFooterLink } from './card-footer-link';

const SKELETON_ROWS = 6;
const SKELETON_COLS = 5;

export function Top20Card() {
  const [round, setRound] = useState<Top20RoundFilter>(DEFAULT_TOP20_ROUND);
  const { data: entries, isLoading, isError, error } = useTop20(round);
  const router = useRouter();

  const handleRowClick = (storeId: string) => {
    router.push(ROUTES.STORE_DETAIL(storeId));
  };

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-text-main">{TOP20_TEXT.title}</CardTitle>
        <Select value={round} onValueChange={(value) => setRound(value as Top20RoundFilter)}>
          <SelectTrigger className="h-8 w-28 text-xs" aria-label={TOP20_TEXT.roundFilterLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOP20_ROUND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2 pb-3">
        {isLoading && <TableSkeleton rows={SKELETON_ROWS} cols={SKELETON_COLS} />}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && (
          <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-14 text-xs">{TOP20_TEXT.rankColumn}</TableHead>
                  <TableHead className="whitespace-nowrap text-xs">
                    {TOP20_TEXT.storeNameColumn}
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-xs">
                    {TOP20_TEXT.provinceColumn}
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-xs">
                    {TOP20_TEXT.storeTypeColumn}
                  </TableHead>
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
                      tabIndex={0}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(entry.storeId)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleRowClick(entry.storeId);
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
                      colSpan={SKELETON_COLS}
                      className="py-10 text-center text-xs text-charcoal"
                    >
                      {TOP20_TEXT.empty}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-auto flex justify-end pt-1">
          <CardFooterLink href={ROUTES.STORES} label={TOP20_TEXT.footerLink} />
        </div>
      </CardContent>
    </Card>
  );
}
