import type { Metadata } from 'next';
import { ErrorPage } from '@/components/shared/error-page';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'ระบบไม่พร้อมให้บริการ',
};

export default function ServiceUnavailablePage() {
  return (
    <ErrorPage
      code={HTTP_STATUS.SERVICE_UNAVAILABLE}
      title="ระบบไม่พร้อมให้บริการ"
      message="ระบบกำลังอยู่ในช่วงบำรุงรักษาหรือมีโหลดสูง กรุณาลองอีกครั้งในอีกสักครู่"
      actions={[
        { label: 'ลองอีกครั้ง', reload: true, variant: 'default' },
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
      ]}
    />
  );
}
