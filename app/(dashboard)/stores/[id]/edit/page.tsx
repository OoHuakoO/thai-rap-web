import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
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
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link
          href={ROUTES.STORE_DETAIL(id)}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับไปรายละเอียดร้าน
        </Link>
        <h1 className="text-2xl font-semibold">แก้ไขร้านอาหาร</h1>
      </div>

      <StoreEditPage storeId={id} />
    </section>
  )
}
