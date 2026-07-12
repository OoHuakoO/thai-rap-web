import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { CreateStoreForm } from '@/features/store'

export const metadata: Metadata = {
  title: 'เพิ่มร้านอาหาร | Thai Rap',
}

export default function NewStorePage() {
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link
          href={ROUTES.STORES}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับไปรายการร้านอาหาร
        </Link>
        <h1 className="text-2xl font-semibold">เพิ่มร้านอาหาร</h1>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <CreateStoreForm />
      </div>
    </section>
  )
}
