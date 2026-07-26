import type { Metadata } from 'next';
import { ErrorPage } from '@/components/shared/error-page';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'คำขอมากเกินไป',
};

export default function RateLimitPage() {
  return (
    <ErrorPage
      code={HTTP_STATUS.RATE_LIMITED}
      title="คำขอมากเกินไป"
      message="คุณส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง"
      actions={[{ label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' }]}
    />
  );
}
