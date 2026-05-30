import type { Metadata } from 'next'
import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'คำขอมากเกินไป | Thai Rap',
}

export default function RateLimitPage() {
  return (
    <ErrorPage
      code={429}
      title="คำขอมากเกินไป"
      message="คุณส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง"
      actions={[
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' },
      ]}
    />
  )
}
