'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2, Store as StoreIcon } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { buildFileUrl } from '@/utils/build-file-url';
import { cn } from '@/utils/cn';
import { STORE_DIALOG_TEXT } from '../constants/store-dialog.constants';
import { STORE_LIST_TEXT } from '../constants/store-list.constants';
import { useStores, useDeleteStore } from '../hooks/use-stores';
import { STORE_STATUS_LABELS } from '../types/store.types';
import type { Store, StoreStatus, StoreQueryParams } from '../types/store.types';
import type { TableColumn } from '@/types';

const STATUS_VARIANT: Record<StoreStatus, StatusVariant> = {
  REGISTERED: 'inactive',
  T0_COMPLETED: 'new',
  CAMP_COMPLETED: 'pending',
  T1_COMPLETED: 'purple',
  PITCHING_COMPLETED: 'pending',
  SELECTED: 'pass',
  CONDITIONAL_SELECTED: 'warning',
  WAITING_LIST: 'pending',
  NOT_SELECTED: 'fail',
  FIELD_AUDITED: 'pending',
  IDP_CREATED: 'pending',
  COMPLETED: 'active',
};

interface StoreListProps {
  query?: StoreQueryParams;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function StoreList({ query, selectedId, onSelect }: StoreListProps) {
  const can = useAuthStore((s) => s.can);
  const { data, isLoading, isError, error } = useStores(query);
  const { mutate: deleteStore, isPending: isDeleting } = useDeleteStore();
  const confirm = useConfirm();

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>;
  }

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: STORE_DIALOG_TEXT.deleteStoreTitle,
      description: STORE_DIALOG_TEXT.deleteStoreDescription(name),
      confirmLabel: STORE_DIALOG_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;
    deleteStore(id, {
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const columns: TableColumn<Store>[] = [
    {
      key: 'name',
      header: STORE_LIST_TEXT.nameHeader,
      className: 'text-center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            {row.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={buildFileUrl(row.coverUrl)}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <StoreIcon className="h-4 w-4 text-muted-foreground/60" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">{row.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'province', header: STORE_LIST_TEXT.provinceHeader, className: 'text-center' },
    { key: 'storeType', header: STORE_LIST_TEXT.storeTypeHeader, className: 'text-center' },
    {
      key: 'status',
      header: STORE_LIST_TEXT.statusHeader,
      className: 'text-center',
      cell: (row) => (
        <StatusBadge status={STATUS_VARIANT[row.status]} label={STORE_STATUS_LABELS[row.status]} />
      ),
    },
    {
      key: 'latestScore',
      header: STORE_LIST_TEXT.latestScoreHeader,
      className: 'text-center',
      cell: (row) =>
        typeof row.latestScore === 'number' ? (
          <span className="text-sm font-bold text-orange">{row.latestScore.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'latestAssessorName',
      header: STORE_LIST_TEXT.latestAssessorHeader,
      className: 'text-center',
      cell: (row) =>
        row.latestAssessorName ? (
          <div>
            <p className="text-xs font-medium text-charcoal">{row.latestAssessorName}</p>
            {row.latestAssessedAt && (
              <p className="text-[10px] text-muted-foreground">
                {new Date(row.latestAssessedAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'actions',
      header: STORE_LIST_TEXT.actionsHeader,
      className: 'text-center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-7 w-7',
              selectedId === row.id && 'border-orange text-orange hover:bg-orange/10'
            )}
            asChild
          >
            <Link href={ROUTES.STORE_DETAIL(row.id)} title={STORE_LIST_TEXT.viewDetailTitle}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {can('store:write') && (
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link
                href={ROUTES.STORE_EDIT(row.id)}
                title={STORE_LIST_TEXT.editStoreTitle}
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          {can('store:delete') && (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
              title={STORE_LIST_TEXT.deleteStoreTitle}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id, row.name);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<Store>
      columns={columns}
      data={data?.items ?? []}
      keyField="id"
      isLoading={isLoading}
      emptyMessage={STORE_LIST_TEXT.emptyMessage}
      className="bg-card"
      onRowClick={onSelect ? (row) => onSelect(row.id) : undefined}
      isRowSelected={selectedId ? (row) => row.id === selectedId : undefined}
    />
  );
}
