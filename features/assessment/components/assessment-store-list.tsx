'use client';

import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useStores, STORE_STATUS_LABELS } from '@/features/store';
import type { Store } from '@/features/store';
import type { TableColumn } from '@/types';
import { EMPTY_STORE_MESSAGE, STORE_LIST_TEXT } from '../constants/assessment-text.constants';
import { STORE_STATUS_VARIANT } from '../constants/store-status-variant.constants';

export function AssessmentStoreList() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useStores();

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>;
  }

  const columns: TableColumn<Store>[] = [
    {
      key: 'name',
      header: STORE_LIST_TEXT.columnStore,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange to-orange-light text-base text-white">
            🍜
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
    { key: 'province', header: STORE_LIST_TEXT.columnProvince },
    {
      key: 'status',
      header: STORE_LIST_TEXT.columnStatus,
      cell: (row) => (
        <StatusBadge
          status={STORE_STATUS_VARIANT[row.status]}
          label={STORE_STATUS_LABELS[row.status]}
        />
      ),
    },
  ];

  return (
    <DataTable<Store>
      columns={columns}
      data={data?.items ?? []}
      keyField="id"
      isLoading={isLoading}
      emptyMessage={EMPTY_STORE_MESSAGE}
      className="bg-card"
      onRowClick={(row) => router.push(ROUTES.ASSESSMENT_PICK_ROUND(row.id))}
    />
  );
}
