'use client';

import { Download, Loader2 } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { TableSkeleton } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ASSESSMENT_ROUND_COLUMNS } from '../constants/dashboard-display.constants';
import { STORE_SCORES_DIALOG_TEXT } from '../constants/dashboard-text.constants';
import { useExportStoreRoundScores } from '../hooks/use-export-store-round-scores';
import { useStoreRoundScores } from '../hooks/use-store-round-scores';

const SKELETON_ROWS = 8;
const TEXT_COLUMN_COUNT = 3;

interface StoreScoresDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoreScoresDialog({ open, onOpenChange }: StoreScoresDialogProps) {
  const { data: rows, isLoading, isError, error } = useStoreRoundScores(open);
  const { mutate: exportScores, isPending: isExporting } = useExportStoreRoundScores();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-base">{STORE_SCORES_DIALOG_TEXT.title}</DialogTitle>
          <DialogDescription>{STORE_SCORES_DIALOG_TEXT.description}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <TableSkeleton
            rows={SKELETON_ROWS}
            cols={TEXT_COLUMN_COUNT + ASSESSMENT_ROUND_COLUMNS.length}
          />
        )}

        {!isLoading && isError && (
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        )}

        {!isLoading && !isError && !rows?.length && (
          <AlertCard variant="info" message={STORE_SCORES_DIALOG_TEXT.empty} />
        )}

        {!isLoading && !isError && !!rows?.length && (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{STORE_SCORES_DIALOG_TEXT.provinceColumn}</TableHead>
                  <TableHead>{STORE_SCORES_DIALOG_TEXT.storeNameColumn}</TableHead>
                  <TableHead>{STORE_SCORES_DIALOG_TEXT.storeTypeColumn}</TableHead>
                  {ASSESSMENT_ROUND_COLUMNS.map((round) => (
                    <TableHead key={round} className="text-right">
                      {round}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.storeId}>
                    <TableCell className="whitespace-nowrap">{row.province}</TableCell>
                    <TableCell className="font-medium">{row.storeName}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.storeType}</TableCell>
                    {ASSESSMENT_ROUND_COLUMNS.map((round) => (
                      <TableCell key={round} className="text-right tabular-nums">
                        {row.scores[round] === null
                          ? STORE_SCORES_DIALOG_TEXT.noScore
                          : row.scores[round]?.toFixed(2)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => exportScores()}
            disabled={isExporting || !rows?.length}
            className="bg-orange text-white hover:bg-orange-light"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting
              ? STORE_SCORES_DIALOG_TEXT.downloading
              : STORE_SCORES_DIALOG_TEXT.downloadLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
