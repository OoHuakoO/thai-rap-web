'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCard } from '@/components/shared/alert-card';
import { DataTable } from '@/components/shared/data-table';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Role } from '@/types/auth.types';
import { ROLE_LABELS } from '@/types/auth.types';
import type { TableColumn } from '@/types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDateTime } from '@/utils/format-thai-date';
import {
  DEFAULT_USER_PAGE_LIMIT,
  FILTER_ALL_VALUE,
  USER_LIST_TEXT,
  USER_ROLE_FILTER_OPTIONS,
  USER_STATUS_FILTER_OPTIONS,
} from '../constants/user-list.constants';
import { useUsers } from '../hooks/use-users';
import type { User, UserStatus } from '../types/user.types';
import { USER_STATUSES, USER_STATUS_LABELS } from '../types/user.types';
import { UserRowActions } from './user-row-actions';

const STATUS_VARIANT: Record<UserStatus, 'active' | 'pending' | 'inactive'> = {
  [USER_STATUSES.ACTIVE]: 'active',
  [USER_STATUSES.PENDING]: 'pending',
  [USER_STATUSES.SUSPENDED]: 'inactive',
};

export function UserList() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | typeof FILTER_ALL_VALUE>(FILTER_ALL_VALUE);
  const [status, setStatus] = useState<UserStatus | typeof FILTER_ALL_VALUE>(FILTER_ALL_VALUE);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_USER_PAGE_LIMIT);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUsers({
    search: search || undefined,
    role: role === FILTER_ALL_VALUE ? undefined : role,
    status: status === FILTER_ALL_VALUE ? undefined : status,
    page,
    limit,
  });

  // Any filter change re-slices the result set, so the current page number no
  // longer means anything — landing on an out-of-range page renders an empty
  // table that looks like "no results".
  const resetToFirstPage = () => setPage(1);

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: USER_LIST_TEXT.columnName,
      cell: (user) => (
        <div>
          <p className="font-medium text-text-main">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: USER_LIST_TEXT.columnRole,
      // Read-only on purpose: the role a user registered with is the role they
      // keep. Changing it is not a correction of a mistake, it is handing out a
      // different access level, and that belongs to the account itself.
      cell: (user) => <span className="text-charcoal">{ROLE_LABELS[user.role]}</span>,
    },
    {
      key: 'assignedStores',
      header: USER_LIST_TEXT.columnStores,
      cell: (user) => {
        // The count is what fits in the column; the names behind it live in the
        // tooltip, so a row stays readable whether the user has one store or ten.
        const groups = [
          {
            label: USER_LIST_TEXT.assignedCount(user.assignedStores.length),
            stores: user.assignedStores,
          },
          { label: USER_LIST_TEXT.ownedCount(user.ownedStores.length), stores: user.ownedStores },
        ].filter((group) => group.stores.length > 0);

        if (groups.length === 0) {
          return <span className="text-xs text-muted-foreground">{USER_LIST_TEXT.noStores}</span>;
        }
        return (
          <TooltipProvider delayDuration={150}>
            <div className="text-xs text-charcoal">
              {groups.map((group) => (
                <Tooltip key={group.label}>
                  <TooltipTrigger asChild>
                    <p className="w-fit cursor-default underline decoration-dotted underline-offset-4">
                      {group.label}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent align="start" className="max-w-xs">
                    <ul className="space-y-0.5 text-xs">
                      {group.stores.map((store) => (
                        <li key={store.id}>{store.name}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'status',
      header: USER_LIST_TEXT.columnStatus,
      cell: (user) => (
        <StatusBadge status={STATUS_VARIANT[user.status]} label={USER_STATUS_LABELS[user.status]} />
      ),
    },
    {
      key: 'lastLogin',
      header: USER_LIST_TEXT.columnLastLogin,
      cell: (user) => (
        <span className="text-xs text-muted-foreground">
          {user.lastLogin ? formatThaiDateTime(user.lastLogin) : USER_LIST_TEXT.neverLoggedIn}
        </span>
      ),
    },
    {
      key: 'actions',
      header: USER_LIST_TEXT.columnActions,
      className: 'text-right',
      cell: (user) => <UserRowActions user={user} />,
    },
  ];

  if (isError) {
    return (
      <AlertCard
        variant="error"
        title={USER_LIST_TEXT.loadError}
        message={extractErrorMessage(error)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetToFirstPage();
          }}
          placeholder={USER_LIST_TEXT.searchPlaceholder}
          className="w-full sm:w-64"
          aria-label={USER_LIST_TEXT.searchPlaceholder}
        />

        <Select
          value={role}
          onValueChange={(val) => {
            setRole(val as Role | typeof FILTER_ALL_VALUE);
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="w-56" aria-label={USER_LIST_TEXT.columnRole}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL_VALUE}>{USER_LIST_TEXT.filterAllRoles}</SelectItem>
            {USER_ROLE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val as UserStatus | typeof FILTER_ALL_VALUE);
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="w-44" aria-label={USER_LIST_TEXT.columnStatus}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL_VALUE}>{USER_LIST_TEXT.filterAllStatuses}</SelectItem>
            {USER_STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {users && (
          <span className="ml-auto text-sm text-muted-foreground">
            {USER_LIST_TEXT.total(users.meta.total)}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={users?.items ?? []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage={USER_LIST_TEXT.empty}
      />

      {users && users.meta.totalPages > 1 && (
        <PaginationBar
          page={users.meta.page}
          limit={users.meta.limit}
          total={users.meta.total}
          totalPages={users.meta.totalPages}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            resetToFirstPage();
          }}
        />
      )}
    </div>
  );
}
