'use client'

import { Loading } from '@/components/shared/loading'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useStore } from '../hooks/use-stores'
import { EditStoreForm } from './edit-store-form'
import { StoreLogoManager } from './store-logo-manager'
import { StorePhotoGalleryManager } from './store-photo-gallery-manager'
import { StoreDocumentManager } from './store-document-manager'

interface StoreEditPageProps {
  storeId: string
}

export function StoreEditPage({ storeId }: StoreEditPageProps) {
  const { data: store, isLoading, isError, error } = useStore(storeId)

  if (isLoading) return <Loading className="py-16" />

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>
  }

  if (!store) {
    return <p className="py-8 text-center text-muted-foreground">ไม่พบร้านนี้</p>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-charcoal">ข้อมูลร้าน</h2>
        <EditStoreForm store={store} />
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-bold text-charcoal">สื่อและเอกสาร</h2>
        <StoreLogoManager storeId={store.id} logoUrl={store.logoUrl} />
        <StorePhotoGalleryManager
          storeId={store.id}
          label="รูปหน้าร้าน"
          photos={store.storefrontPhotos}
          variant="storefront"
          emptyMessage="ยังไม่มีรูปหน้าร้าน"
        />
        <StorePhotoGalleryManager
          storeId={store.id}
          label="ภาพเมนูอาหาร"
          photos={store.photos}
          variant="menu"
          emptyMessage="ยังไม่มีภาพเมนูอาหาร"
        />
        <StoreDocumentManager storeId={store.id} documents={store.documents} />
      </div>
    </div>
  )
}
