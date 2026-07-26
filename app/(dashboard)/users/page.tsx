import type { Metadata } from 'next';
import { UserList, UserPageHeader } from '@/features/user';

export const metadata: Metadata = {
  title: 'ผู้ใช้งานและสิทธิ์',
};

export default function UsersPage() {
  return (
    <section className="space-y-4">
      <UserPageHeader />
      <UserList />
    </section>
  );
}
