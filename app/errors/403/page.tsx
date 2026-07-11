import type { Metadata } from 'next'
import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'ไม่มีสิทธิ์เข้าถึง | Thai Rap',
}

export default function ForbiddenPage() {
  return (
    <ErrorPage
      code={403}
      title="ไม่มีสิทธิ์เข้าถึง"
      message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด"
      actions={[
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' },
        { label: 'เข้าสู่ระบบอีกครั้ง', href: ROUTES.LOGIN, variant: 'outline' },
      ]}
    />
  )
}
