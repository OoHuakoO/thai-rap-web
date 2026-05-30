import type { Metadata } from 'next'
import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'ไม่พบหน้าที่ต้องการ | Thai Rap',
}

export default function NotFound() {
  return (
    <ErrorPage
      code={404}
      title="ไม่พบหน้าที่ต้องการ"
      message="ขออภัย ไม่พบหน้าที่คุณต้องการ อาจถูกย้ายหรือลบไปแล้ว"
      actions={[
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' },
      ]}
    />
  )
}
