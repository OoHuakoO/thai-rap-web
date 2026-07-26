import type { Metadata } from 'next';
import { AccessControlPage } from '@/features/access-control';

export const metadata: Metadata = {
  title: 'กำหนดสิทธิ์การเข้าถึง | Thai Rap',
};

export default function UserPermissionsPage() {
  return <AccessControlPage />;
}
