import type { Metadata } from 'next'
import { AssessmentEntry } from '@/features/assessment'

export const metadata: Metadata = {
  title: 'แบบประเมินร้าน | Thai Rap',
}

export default function AssessmentPage() {
  return (
    <section className="space-y-4">
      <AssessmentEntry />
    </section>
  )
}
