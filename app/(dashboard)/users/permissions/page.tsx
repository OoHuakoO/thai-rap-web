import type { Metadata } from 'next';
import { AccessControlPage } from '@/features/access-control';

export const metadata: Metadata = {
  title: 'กำหนดสิทธิ์การเข้าถึง',
};

export default function UserPermissionsPage() {
  return (
    <section className="space-y-4">
      <AccessControlPage />
    </section>
  );
}
