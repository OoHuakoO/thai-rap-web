'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Images, Plus, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PhotoPreviewGrid } from '@/components/shared/photo-preview-grid';
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size';
import { STORE_FORM_TEXT } from '../constants/store-form.constants';

function filterValidFiles(files: File[]): File[] {
  const valid: File[] = [];
  for (const file of files) {
    if (isFileSizeValid(file)) {
      valid.push(file);
    } else {
      toast.error(fileTooLargeMessage(file));
    }
  }
  return valid;
}

interface PhotoPickerSectionProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
}

function PhotoPickerSection({ label, files, onChange }: PhotoPickerSectionProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <Label>{STORE_FORM_TEXT.optionalLabel(label)}</Label>
        <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border bg-card px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange">
          <Plus className="h-3 w-3" />
          เพิ่มรูป
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files)
                onChange([...files, ...filterValidFiles(Array.from(e.target.files))]);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <PhotoPreviewGrid
        photos={previews}
        alt={label}
        emptyMessage="ยังไม่มีรูป"
        onRemove={(i) => onChange(files.filter((_, idx) => idx !== i))}
        removeAriaLabel={(i) => `ลบรูป ${i + 1}`}
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface StoreMediaPickerProps {
  storePhotoFiles: File[];
  onStorePhotoFilesChange: (files: File[]) => void;
  menuFiles: File[];
  onMenuFilesChange: (files: File[]) => void;
  documentFiles: File[];
  onDocumentFilesChange: (files: File[]) => void;
}

export function StoreMediaPicker({
  storePhotoFiles,
  onStorePhotoFilesChange,
  menuFiles,
  onMenuFilesChange,
  documentFiles,
  onDocumentFilesChange,
}: StoreMediaPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
          <Images className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold text-charcoal">รูปภาพและเอกสาร</p>
          <p className="text-sm text-muted-foreground">แนบรูปร้านค้า เมนู และเอกสารประกอบร้าน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <PhotoPickerSection
          label="รูปร้านค้า"
          files={storePhotoFiles}
          onChange={onStorePhotoFilesChange}
        />
        <PhotoPickerSection label="ภาพเมนูอาหาร" files={menuFiles} onChange={onMenuFilesChange} />
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <Label>{STORE_FORM_TEXT.documentsLabel}</Label>
          <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border bg-card px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange">
            <Upload className="h-3 w-3" />
            แนบไฟล์
            <input
              type="file"
              multiple
              accept="application/pdf,.xlsx,.docx,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  onDocumentFilesChange([
                    ...documentFiles,
                    ...filterValidFiles(Array.from(e.target.files)),
                  ]);
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {documentFiles.length > 0 ? (
          <ul className="space-y-1">
            {documentFiles.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded border bg-card px-2 py-1 text-[10.5px]"
              >
                <span className="truncate text-charcoal">
                  {file.name}{' '}
                  <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
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
        ) : (
          <p className="text-[10.5px] text-muted-foreground">ยังไม่มีเอกสารแนบ</p>
        )}
      </div>
    </div>
  );
}
