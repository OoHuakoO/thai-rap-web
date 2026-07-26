'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCard } from '@/components/shared/alert-card';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types/auth.types';
import { DATA_SCOPE_LABELS, PERMISSIONS, ROLES, ROLE_LABELS } from '@/types/auth.types';
import { getDataScope } from '@/constants/permissions';
import type { TableColumn } from '@/types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { formatThaiDateTime } from '@/utils/format-thai-date';
import {
  FILTER_ALL_VALUE,
  USER_LIST_TEXT,
  USER_ROLE_FILTER_OPTIONS,
  USER_STATUS_FILTER_OPTIONS,
} from '../constants/user-list.constants';
import { useDeleteUser, useUsers } from '../hooks/use-users';
import type { User, UserStatus } from '../types/user.types';
import { USER_STATUSES, USER_STATUS_LABELS } from '../types/user.types';
import { UserRoleSelect } from './user-role-select';

const STATUS_VARIANT: Record<UserStatus, 'active' | 'pending' | 'inactive'> = {
  [USER_STATUSES.ACTIVE]: 'active',
  [USER_STATUSES.PENDING]: 'pending',
  [USER_STATUSES.SUSPENDED]: 'inactive',
};

export function UserList() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | typeof FILTER_ALL_VALUE>(FILTER_ALL_VALUE);
  const [status, setStatus] = useState<UserStatus | typeof FILTER_ALL_VALUE>(FILTER_ALL_VALUE);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUsers({
    search: search || undefined,
    role: role === FILTER_ALL_VALUE ? undefined : role,
    status: status === FILTER_ALL_VALUE ? undefined : status,
  });

  const { mutate: deleteUser } = useDeleteUser();
  const confirm = useConfirm();
  const can = useAuthStore((s) => s.can);
  const canWrite = can(PERMISSIONS.USERS_WRITE);
  const canDelete = can(PERMISSIONS.USERS_DELETE);

  const handleDelete = async (user: User) => {
    const confirmed = await confirm({
      title: USER_LIST_TEXT.deleteTitle,
      description: USER_LIST_TEXT.deleteDescription(user.name),
      confirmLabel: USER_LIST_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;

    deleteUser(user.id, {
      onSuccess: () => toast.success(USER_LIST_TEXT.deleteSuccess),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

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
      // SUPER_ADMIN's role is never editable here, so the account that grants
      // access can't be demoted by accident. The API enforces the same rule.
      cell: (user) =>
        canWrite && user.role !== ROLES.SUPER_ADMIN ? (
          <UserRoleSelect user={user} />
        ) : (
          <span className="text-charcoal">{ROLE_LABELS[user.role]}</span>
        ),
    },
    {
      key: 'organization',
      header: USER_LIST_TEXT.columnOrganization,
      cell: (user) => <span className="text-charcoal">{user.organization ?? '-'}</span>,
    },
    {
      key: 'phone',
      header: USER_LIST_TEXT.columnPhone,
      cell: (user) => <span className="text-charcoal">{user.phone ?? '-'}</span>,
    },
    {
      key: 'assignedStoreIds',
      header: USER_LIST_TEXT.columnScope,
      cell: (user) => (
        <div className="text-xs">
          <p className="text-charcoal">{DATA_SCOPE_LABELS[getDataScope(user.role, 'store')]}</p>
          {user.assignedStoreIds.length > 0 && (
            <p className="text-muted-foreground">
              {USER_LIST_TEXT.assignedCount(user.assignedStoreIds.length)}
            </p>
          )}
        </div>
      ),
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
      className: 'w-12',
      cell: (user) =>
        canDelete && user.role !== ROLES.SUPER_ADMIN ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${USER_LIST_TEXT.deleteTitle} ${user.name}`}
            onClick={() => handleDelete(user)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : null,
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder={USER_LIST_TEXT.searchPlaceholder}
          className="w-full sm:w-64"
          aria-label={USER_LIST_TEXT.searchPlaceholder}
        />

        <Select
          value={role}
          onValueChange={(val) => setRole(val as Role | typeof FILTER_ALL_VALUE)}
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
          onValueChange={(val) => setStatus(val as UserStatus | typeof FILTER_ALL_VALUE)}
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
            {USER_LIST_TEXT.total(users.length)}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={users ?? []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage={USER_LIST_TEXT.empty}
      />
    </div>
  );
}
