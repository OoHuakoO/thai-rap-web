import type { Metadata } from 'next';
import { ErrorPage } from '@/components/shared/error-page';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'ไม่พบหน้าที่ต้องการ',
};

export default function NotFound() {
  return (
    <ErrorPage
      code={HTTP_STATUS.NOT_FOUND}
      title="ไม่พบหน้าที่ต้องการ"
      message="ขออภัย ไม่พบหน้าที่คุณต้องการ อาจถูกย้ายหรือลบไปแล้ว"
      actions={[{ label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' }]}
    />
  );
}
