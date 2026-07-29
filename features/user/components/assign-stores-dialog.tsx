'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCard } from '@/components/shared/alert-card';
import { Loading } from '@/components/shared/loading';
import { useStores } from '@/features/store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  ASSIGN_STORES_PAGE_SIZE,
  ASSIGN_STORES_TEXT,
} from '../constants/assign-stores.constants';
import { useAssignOwnedStores, useAssignStores } from '../hooks/use-users';
import type { User } from '../types/user.types';

/** `assessor` sets who may score a store; `owner` sets Store.ownerId. */
export type AssignStoresMode = 'assessor' | 'owner';

interface AssignStoresDialogProps {
  user: User;
  mode: AssignStoresMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// The row mounts this only while it is open, so the draft selection below is
// seeded on every open. Keeping it mounted across opens would freeze the first
// seed forever: `open` is driven from the row, and Radix fires `onOpenChange`
// only for its own closes — never on the way in — so there is no callback to
// re-seed from.
export function AssignStoresDialog({ user, mode, open, onOpenChange }: AssignStoresDialogProps) {
  const isAssessorMode = mode === 'assessor';
  const initialIds = isAssessorMode ? user.assignedStoreIds : user.ownedStoreIds;

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const {
    data: stores,
    isLoading,
    isError,
    error,
  } = useStores({ limit: ASSIGN_STORES_PAGE_SIZE, search: search || undefined });

  const assignAssessorStores = useAssignStores(user.id);
  const assignOwnedStores = useAssignOwnedStores(user.id);
  const { mutate: assign, isPending } = isAssessorMode
    ? assignAssessorStores
    : assignOwnedStores;

  const toggle = (storeId: string) => {
    setSelectedIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    );
  };

  const handleSave = () => {
    assign(
      { storeIds: selectedIds },
      {
        onSuccess: () => {
          toast.success(
            isAssessorMode ? ASSIGN_STORES_TEXT.assessorSuccess : ASSIGN_STORES_TEXT.ownerSuccess
          );
          onOpenChange(false);
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isAssessorMode ? ASSIGN_STORES_TEXT.assessorTitle : ASSIGN_STORES_TEXT.ownerTitle}
          </DialogTitle>
          <DialogDescription>
            {isAssessorMode
              ? ASSIGN_STORES_TEXT.assessorDescription(user.name)
              : ASSIGN_STORES_TEXT.ownerDescription(user.name)}
          </DialogDescription>
        </DialogHeader>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={ASSIGN_STORES_TEXT.searchPlaceholder}
          aria-label={ASSIGN_STORES_TEXT.searchPlaceholder}
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {ASSIGN_STORES_TEXT.selectedCount(selectedIds.length)}
          </span>
          {selectedIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              {ASSIGN_STORES_TEXT.clearAll}
            </Button>
          )}
        </div>

        {isError ? (
          <AlertCard
            variant="error"
            title={ASSIGN_STORES_TEXT.loadError}
            message={extractErrorMessage(error)}
          />
        ) : isLoading ? (
          <Loading className="py-8" />
        ) : !stores?.items.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {ASSIGN_STORES_TEXT.empty}
          </p>
        ) : (
          <ScrollArea className="h-72 rounded-md border">
            <ul className="divide-y">
              {stores.items.map((store) => {
                const isOwnedByOther =
                  !isAssessorMode && !!store.ownerId && store.ownerId !== user.id;
                return (
                  <li key={store.id}>
                    <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50">
                      <Checkbox
                        checked={selectedIds.includes(store.id)}
                        onCheckedChange={() => toggle(store.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text-main">
                          {store.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">{store.code}</span>
                      </span>
                      {isOwnedByOther && (
                        <Badge variant="outline">{ASSIGN_STORES_TEXT.ownedByOther}</Badge>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {ASSIGN_STORES_TEXT.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? ASSIGN_STORES_TEXT.saving : ASSIGN_STORES_TEXT.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
