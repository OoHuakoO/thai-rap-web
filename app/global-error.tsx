'use client'

import { inter, sarabun } from '@/styles/fonts'
import { ErrorPage } from '@/components/shared/error-page'
import { ROUTES } from '@/constants/routes'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${sarabun.variable} font-sans`}>
        <ErrorPage
          code={500}
          title="เกิดข้อผิดพลาด"
          message={error.message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง'}
          actions={[
            { label: 'ลองอีกครั้ง', onClick: reset, variant: 'default' },
            { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
          ]}
        />
      </body>
    </html>
  )
}
