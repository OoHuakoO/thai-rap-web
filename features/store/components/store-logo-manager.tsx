'use client'

import { useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { buildFileUrl } from '@/utils/build-file-url'
import { useUploadStoreLogo, useDeleteStoreLogo } from '../hooks/use-stores'

interface StoreLogoManagerProps {
  storeId: string
  logoUrl: string | null
}

export function StoreLogoManager({ storeId, logoUrl }: StoreLogoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadLogo, isPending: isUploading } = useUploadStoreLogo(storeId)
  const { mutate: deleteLogo, isPending: isDeleting } = useDeleteStoreLogo(storeId)

  return (
    <div className="space-y-1.5">
      <Label>โลโก้ร้าน</Label>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={buildFileUrl(logoUrl)} alt="โลโก้ร้าน" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl">🏪</span>
          )}
        </div>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded border border-dashed border-border px-2 py-1 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange disabled:opacity-50"
        >
          <Upload className="h-3 w-3" />
          {isUploading ? 'กำลังอัปโหลด...' : logoUrl ? 'เปลี่ยนโลโก้' : 'เลือกโลโก้'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadLogo(file, { onError: (err) => toast.error(extractErrorMessage(err)) })
            e.target.value = ''
          }}
        />
        {logoUrl && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => deleteLogo(undefined, { onError: (err) => toast.error(extractErrorMessage(err)) })}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-white disabled:opacity-50"
            aria-label="ลบโลโก้"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
