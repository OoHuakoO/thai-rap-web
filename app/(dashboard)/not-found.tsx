import type { Metadata } from 'next';
import { ErrorPage } from '@/components/shared/error-page';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'ไม่พบข้อมูล',
};

/**
 * Catches `notFound()` thrown from a dashboard route — an unknown assessment
 * round, for example. Without it those fall through to the root `not-found`,
 * which renders outside AppShell and strands the user with no navigation.
 */
export default function DashboardNotFound() {
  return (
    <ErrorPage
      className="min-h-[60vh]"
      code={HTTP_STATUS.NOT_FOUND}
      title="ไม่พบข้อมูลที่ต้องการ"
      message="ขออภัย ไม่พบข้อมูลที่คุณต้องการ อาจถูกย้ายหรือลบไปแล้ว"
      actions={[{ label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' }]}
    />
  );
}
