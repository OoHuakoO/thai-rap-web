'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/useAuthStore';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { buildFileUrl } from '@/utils/build-file-url';
import { STORE_DIALOG_TEXT } from '../constants/store-dialog.constants';
import { useStores, useDeleteStore } from '../hooks/use-stores';
import { STORE_STATUS_LABELS } from '../types/store.types';
import type { Store, StoreStatus, StoreQueryParams } from '../types/store.types';
import type { TableColumn } from '@/types';

const STATUS_VARIANT: Record<StoreStatus, StatusVariant> = {
  REGISTERED: 'new',
  T0_COMPLETED: 'pending',
  CAMP_COMPLETED: 'pending',
  T1_COMPLETED: 'pending',
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
      header: 'ร้าน',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-orange to-orange-light text-base text-white">
            {row.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={buildFileUrl(row.logoUrl)}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              '🍜'
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.ownerName} · {row.storeType}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'province', header: 'จังหวัด' },
    { key: 'storeType', header: 'ประเภท' },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (row) => (
        <StatusBadge status={STATUS_VARIANT[row.status]} label={STORE_STATUS_LABELS[row.status]} />
      ),
    },
    {
      key: 'latestScore',
      header: 'คะแนนล่าสุด',
      cell: (row) =>
        typeof row.latestScore === 'number' ? (
          <span className="text-sm font-bold text-orange">{row.latestScore.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'latestAssessorName',
      header: 'ผู้ประเมิน',
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
      header: 'จัดการ',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href={ROUTES.STORE_DETAIL(row.id)} title="ดูรายละเอียดเต็ม">
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {can('store:write') && (
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link
                href={ROUTES.STORE_EDIT(row.id)}
                title="แก้ไขร้าน"
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
              title="ลบร้าน"
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
      emptyMessage="ยังไม่มีร้านในระบบ"
      className="bg-card"
      onRowClick={onSelect ? (row) => onSelect(row.id) : undefined}
      isRowSelected={selectedId ? (row) => row.id === selectedId : undefined}
    />
  );
}
