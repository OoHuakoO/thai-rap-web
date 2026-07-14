import type { Metadata } from 'next'
import { CreateStoreForm, StoreFormHeader, StoreListBackLink } from '@/features/store'

export const metadata: Metadata = {
  title: 'เพิ่มร้านอาหาร | Thai Rap',
}

export default function NewStorePage() {
  return (
    <section className="space-y-4">
      <StoreListBackLink />
      <StoreFormHeader mode="create" />
      <CreateStoreForm />
    </section>
  )
}
