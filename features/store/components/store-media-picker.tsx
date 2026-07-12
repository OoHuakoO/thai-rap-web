'use client'

import { useEffect, useState } from 'react'
import { Plus, Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface PhotoPickerSectionProps {
  label: string
  files: File[]
  onChange: (files: File[]) => void
}

function PhotoPickerSection({ label, files, onChange }: PhotoPickerSectionProps) {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label} (ไม่บังคับ)</Label>
        <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange">
          <Plus className="h-3 w-3" />
          เพิ่มรูป
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onChange([...files, ...Array.from(e.target.files)])
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={label} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                aria-label={`ลบรูป ${i + 1}`}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface StoreMediaPickerProps {
  logoFile: File | null
  onLogoChange: (file: File | null) => void
  storefrontFiles: File[]
  onStorefrontFilesChange: (files: File[]) => void
  menuFiles: File[]
  onMenuFilesChange: (files: File[]) => void
  documentFiles: File[]
  onDocumentFilesChange: (files: File[]) => void
}

export function StoreMediaPicker({
  logoFile,
  onLogoChange,
  storefrontFiles,
  onStorefrontFilesChange,
  menuFiles,
  onMenuFilesChange,
  documentFiles,
  onDocumentFilesChange,
}: StoreMediaPickerProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null)
      return
    }
    const url = URL.createObjectURL(logoFile)
    setLogoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [logoFile])

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-1.5">
        <Label>โลโก้ร้าน (ไม่บังคับ)</Label>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="โลโก้ร้าน" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">🏪</span>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border px-2 py-1 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange">
            <Upload className="h-3 w-3" />
            {logoFile ? 'เปลี่ยนโลโก้' : 'เลือกโลโก้'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                onLogoChange(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
          </label>
          {logoFile && (
            <button
              type="button"
              onClick={() => onLogoChange(null)}
              className="text-[10.5px] text-destructive hover:underline"
            >
              ลบ
            </button>
          )}
        </div>
      </div>

      <PhotoPickerSection
        label="รูปหน้าร้าน"
        files={storefrontFiles}
        onChange={onStorefrontFilesChange}
      />

      <PhotoPickerSection label="ภาพเมนูอาหาร" files={menuFiles} onChange={onMenuFilesChange} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>เอกสารแนบ (ไม่บังคับ)</Label>
          <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange">
            <Upload className="h-3 w-3" />
            แนบไฟล์
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf,.xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) onDocumentFilesChange([...documentFiles, ...Array.from(e.target.files)])
                e.target.value = ''
              }}
            />
          </label>
        </div>
        {documentFiles.length > 0 && (
          <ul className="space-y-1">
            {documentFiles.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded border px-2 py-1 text-[10.5px]"
              >
                <span className="truncate text-charcoal">
                  {file.name} <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                </span>
                <button
                  type="button"
                  onClick={() => onDocumentFilesChange(documentFiles.filter((_, idx) => idx !== i))}
                  aria-label={`ลบไฟล์ ${file.name}`}
                  className="ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
