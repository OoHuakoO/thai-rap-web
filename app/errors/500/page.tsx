import type { Metadata } from 'next';
import { ErrorPage } from '@/components/shared/error-page';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'ข้อผิดพลาดจากเซิร์ฟเวอร์',
};

export default function ServerErrorPage() {
  return (
    <ErrorPage
      code={HTTP_STATUS.SERVER_ERROR}
      title="ข้อผิดพลาดจากเซิร์ฟเวอร์"
      message="เกิดข้อผิดพลาดภายในระบบ ทีมงานได้รับแจ้งแล้วและกำลังดำเนินการแก้ไข"
      actions={[
        { label: 'ลองอีกครั้ง', reload: true, variant: 'default' },
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
      ]}
    />
  );
}
