'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TOP20_DIALOG_TEXT } from '../constants/dashboard-text.constants';
import type { Top20Entry } from '../types/dashboard.types';
import { Top20Table } from './top20-table';

interface Top20DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: Top20Entry[] | undefined;
  canOpenStore: boolean;
  onRowClick: (storeId: string) => void;
}

// The card caps its table at ~5 visible rows, so the footer opens the same
// ranking here at full height instead of navigating — there is no standalone
// ranking page for it to link to.
export function Top20Dialog({
  open,
  onOpenChange,
  entries,
  canOpenStore,
  onRowClick,
}: Top20DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-base">{TOP20_DIALOG_TEXT.title}</DialogTitle>
          <DialogDescription>{TOP20_DIALOG_TEXT.description}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <Top20Table
            entries={entries}
            canOpenStore={canOpenStore}
            onRowClick={(storeId) => {
              onOpenChange(false);
              onRowClick(storeId);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
