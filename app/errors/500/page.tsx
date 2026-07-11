'use client'

import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

export default function ServerErrorPage() {
  return (
    <ErrorPage
      code={500}
      title="ข้อผิดพลาดจากเซิร์ฟเวอร์"
      message="เกิดข้อผิดพลาดภายในระบบ ทีมงานได้รับแจ้งแล้วและกำลังดำเนินการแก้ไข"
      actions={[
        { label: 'ลองอีกครั้ง', onClick: () => window.location.reload(), variant: 'default' },
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
      ]}
    />
  )
}
