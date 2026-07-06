import type { Metadata } from 'next'
import { AssessmentStoreList } from '@/features/assessment'

export const metadata: Metadata = {
  title: 'แบบประเมินร้าน | Thai Rap',
}

export default function AssessmentPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">แบบประเมินร้าน</h1>
        <p className="text-sm text-muted-foreground">เลือกร้านเพื่อเริ่มประเมิน</p>
      </div>

      <AssessmentStoreList />
    </section>
  )
}
