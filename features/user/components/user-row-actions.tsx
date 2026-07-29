'use client';

import { useState } from 'react';
import { Check, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS, ROLES } from '@/types/auth.types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ASSIGN_STORES_TEXT } from '../constants/assign-stores.constants';
import { USER_LIST_TEXT } from '../constants/user-list.constants';
import { useApproveUser } from '../hooks/use-users';
import type { User } from '../types/user.types';
import { USER_STATUSES } from '../types/user.types';
import { AssignStoresDialog } from './assign-stores-dialog';
import type { AssignStoresMode } from './assign-stores-dialog';

interface UserRowActionsProps {
  user: User;
}

// Which assignment a row offers is decided by role, matching the API: only an
// ASSESSOR takes assigned stores, only an ENTREPRENEUR takes owned ones. Any
// other role gets no button rather than one that 400s.
const ASSIGN_MODE_BY_ROLE: Partial<Record<User['role'], AssignStoresMode>> = {
  [ROLES.ASSESSOR]: 'assessor',
  [ROLES.ENTREPRENEUR]: 'owner',
};

// Approving and assigning stores are the only actions here. Suspending and
// deleting an account are deliberately absent — an account, once approved, is
// managed at the database level, not from this table.
export function UserRowActions({ user }: UserRowActionsProps) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const confirm = useConfirm();
  const can = useAuthStore((s) => s.can);

  const { mutate: approveUser, isPending: isApproving } = useApproveUser();

  const canWrite = can(PERMISSIONS.USERS_WRITE);
  // SUPER_ADMIN rows carry no actions — the API rejects every one of them, and
  // an account that can lock itself out has no way back.
  const isProtected = user.role === ROLES.SUPER_ADMIN;

  const assignMode = ASSIGN_MODE_BY_ROLE[user.role];
  const isPending = user.status === USER_STATUSES.PENDING;
  const isSuspended = user.status === USER_STATUSES.SUSPENDED;

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: USER_LIST_TEXT.approveTitle,
      description: USER_LIST_TEXT.approveDescription(user.name),
      confirmLabel: USER_LIST_TEXT.approveConfirmLabel,
    });
    if (!confirmed) return;

    approveUser(user.id, {
      onSuccess: () => toast.success(USER_LIST_TEXT.approveSuccess),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  if (isProtected) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      {canWrite && !isPending && !isSuspended && assignMode && (
        <>
          <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(true)}>
            <Store className="mr-1.5 h-4 w-4" />
            {assignMode === 'assessor'
              ? ASSIGN_STORES_TEXT.assessorTrigger
              : ASSIGN_STORES_TEXT.ownerTrigger}
          </Button>
          <AssignStoresDialog
            user={user}
            mode={assignMode}
            open={isAssignOpen}
            onOpenChange={setIsAssignOpen}
          />
        </>
      )}

      {canWrite && user.status !== USER_STATUSES.ACTIVE && (
        <Button size="sm" onClick={handleApprove} disabled={isApproving}>
          <Check className="mr-1.5 h-4 w-4" />
          {USER_LIST_TEXT.approveAction}
        </Button>
      )}
    </div>
  );
}
