'use client';

import { useMemo, useState } from 'react';
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
  ASSIGN_STORES_MODE_TEXT,
  ASSIGN_STORES_PAGE_SIZE,
  ASSIGN_STORES_TEXT,
} from '../constants/assign-stores.constants';
import type { AssignStoresMode } from '../constants/assign-stores.constants';
import { useAssignOwnedStores, useAssignStores } from '../hooks/use-users';
import type { User } from '../types/user.types';

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
  // ASSESSOR and MENTOR share one list on the API (Store.assignedUsers) and one
  // endpoint; only the copy differs, so `owner` is the sole branch below.
  const isOwnerMode = mode === 'owner';
  const copy = ASSIGN_STORES_MODE_TEXT[mode];
  const initialIds = isOwnerMode ? user.ownedStoreIds : user.assignedStoreIds;

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const {
    data: stores,
    isLoading,
    isError,
    error,
  } = useStores({ limit: ASSIGN_STORES_PAGE_SIZE, search: search || undefined });

  // Stores the user already has float to the top so the current assignment is
  // visible without scrolling the whole page of results. Ordered by
  // `initialIds`, never the live `selectedIds` — sorting on the draft selection
  // would yank a row out from under the cursor the moment it is ticked.
  const sortedStores = useMemo(() => {
    const alreadyAssigned = new Set(initialIds);
    return [...(stores?.items ?? [])].sort(
      (a, b) => Number(alreadyAssigned.has(b.id)) - Number(alreadyAssigned.has(a.id))
    );
  }, [stores, initialIds]);

  const assignAssignedStores = useAssignStores(user.id);
  const assignOwnedStores = useAssignOwnedStores(user.id);
  const { mutate: assign, isPending } = isOwnerMode ? assignOwnedStores : assignAssignedStores;

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
          toast.success(copy.success);
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
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description(user.name)}</DialogDescription>
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
        ) : !sortedStores.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {ASSIGN_STORES_TEXT.empty}
          </p>
        ) : (
          <ScrollArea className="h-72 rounded-md border">
            <ul className="divide-y">
              {sortedStores.map((store) => {
                const isOwnedByOther = isOwnerMode && !!store.ownerId && store.ownerId !== user.id;
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
