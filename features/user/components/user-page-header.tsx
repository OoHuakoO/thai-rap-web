'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { StatCard } from '@/components/shared/stat-card';
import { USER_LIST_TEXT } from '../constants/user-list.constants';
import { useUserStats } from '../hooks/use-users';

// "เพิ่มผู้ใช้งาน" is deliberately absent: the API has no POST /users, and the
// Prisma User model has no phone/organization column for CreateUserForm to
// write to. Accounts are created by registering and then approved from the
// table below — that flow is what the PENDING status exists for. Restore the
// dialog here (CreateUserForm is still in components/) once POST /users ships.
export function UserPageHeader() {
  const { data: stats } = useUserStats();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text-main">{USER_LIST_TEXT.pageTitle}</h1>
        <p className="text-sm text-charcoal">{USER_LIST_TEXT.pageDescription}</p>
      </div>

      {stats && stats.pending > 0 && (
        <AlertCard
          variant="warning"
          title={USER_LIST_TEXT.pendingBannerTitle(stats.pending)}
          message={USER_LIST_TEXT.pendingBannerMessage}
        />
      )}

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={USER_LIST_TEXT.statTotal} value={stats.total} />
          <StatCard title={USER_LIST_TEXT.statPending} value={stats.pending} />
          <StatCard title={USER_LIST_TEXT.statActive} value={stats.active} />
          <StatCard title={USER_LIST_TEXT.statSuspended} value={stats.suspended} />
        </div>
      )}
    </div>
  );
}
