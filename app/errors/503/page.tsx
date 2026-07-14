import type { Metadata } from 'next'
import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'ระบบไม่พร้อมให้บริการ | Thai Rap',
}

export default function ServiceUnavailablePage() {
  return (
    <ErrorPage
      code={503}
      title="ระบบไม่พร้อมให้บริการ"
      message="ระบบกำลังอยู่ในช่วงบำรุงรักษาหรือมีโหลดสูง กรุณาลองอีกครั้งในอีกสักครู่"
      actions={[
        { label: 'ลองอีกครั้ง', reload: true, variant: 'default' },
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
      ]}
    />
  )
}
