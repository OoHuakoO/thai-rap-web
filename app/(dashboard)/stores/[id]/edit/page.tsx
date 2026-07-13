import type { Metadata } from 'next'
import { UtensilsCrossed } from 'lucide-react'
import { BackLink } from '@/components/shared/back-link'
import { ROUTES } from '@/constants/routes'
import { StoreEditPage } from '@/features/store'

export const metadata: Metadata = {
  title: 'แก้ไขร้านอาหาร | Thai Rap',
}

interface EditStorePageProps {
  params: Promise<{ id: string }>
}

export default async function EditStorePageRoute({ params }: EditStorePageProps) {
  const { id } = await params

  return (
    <section className="space-y-4">
      <BackLink href={ROUTES.STORES}>กลับไปรายการร้านอาหาร</BackLink>

      <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-br from-orange to-orange-light p-5 text-white shadow-sm">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
          <UtensilsCrossed className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">แก้ไขร้านอาหาร</h1>
          <p className="text-sm text-white/80">แก้ไขข้อมูลร้านอาหารในระบบ</p>
        </div>
      </div>

      <StoreEditPage storeId={id} />
    </section>
  )
}
