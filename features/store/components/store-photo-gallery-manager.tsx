'use client'

import { useRef } from 'react'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { buildFileUrl } from '@/utils/build-file-url'
import {
  useUploadStorefrontPhoto,
  useDeleteStorefrontPhoto,
  useUploadStorePhoto,
  useDeleteStorePhoto,
} from '../hooks/use-stores'

interface StorePhotoGalleryManagerProps {
  storeId: string
  label: string
  photos: string[]
  variant: 'storefront' | 'menu'
  emptyMessage: string
}

export function StorePhotoGalleryManager({
  storeId,
  label,
  photos,
  variant,
  emptyMessage,
}: StorePhotoGalleryManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadStorefront = useUploadStorefrontPhoto(storeId)
  const deleteStorefront = useDeleteStorefrontPhoto(storeId)
  const uploadMenu = useUploadStorePhoto(storeId)
  const deleteMenu = useDeleteStorePhoto(storeId)

  const { mutate: upload, isPending: isUploading } =
    variant === 'storefront' ? uploadStorefront : uploadMenu
  const { mutate: remove } = variant === 'storefront' ? deleteStorefront : deleteMenu

  const handleSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      upload(file, { onError: (err) => toast.error(extractErrorMessage(err)) })
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded border border-dashed border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground hover:border-orange hover:text-orange disabled:opacity-50"
        >
          <Plus className="h-2.5 w-2.5" />
          {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูป'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            handleSelected(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      {photos.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={buildFileUrl(url)} alt={label} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url, { onError: (err) => toast.error(extractErrorMessage(err)) })}
                aria-label={`ลบ${label}`}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10.5px] text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  )
}
