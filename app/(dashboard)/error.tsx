'use client';

import { ErrorPage } from '@/components/shared/error-page';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      // Renders inside AppShell, which already fills the viewport — the
      // default min-h-screen would overflow its scroll area.
      className="min-h-[60vh]"
      code={HTTP_STATUS.SERVER_ERROR}
      title="เกิดข้อผิดพลาด"
      message={error.message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง'}
      actions={[
        { label: 'ลองอีกครั้ง', onClick: reset, variant: 'default' },
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
      ]}
    />
  );
}
