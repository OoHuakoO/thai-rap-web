'use client'

import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      code={500}
      title="เกิดข้อผิดพลาด"
      message={error.message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง'}
      actions={[
        { label: 'ลองอีกครั้ง', onClick: reset, variant: 'default' },
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
      ]}
    />
  )
}
