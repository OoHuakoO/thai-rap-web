'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PhotoPreviewGrid } from '@/components/shared/photo-preview-grid';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { buildFileUrl } from '@/utils/build-file-url';
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size';
import { STORE_DIALOG_TEXT } from '../constants/store-dialog.constants';
import { STORE_FORM_TEXT } from '../constants/store-form.constants';
import {
  useUploadStorePhoto,
  useDeleteStorePhoto,
  useUploadMenuPhoto,
  useDeleteMenuPhoto,
} from '../hooks/use-stores';

interface StorePhotoGalleryManagerProps {
  storeId: string;
  label: string;
  photos: string[];
  variant: 'store' | 'menu';
  emptyMessage: string;
}

export function StorePhotoGalleryManager({
  storeId,
  label,
  photos,
  variant,
  emptyMessage,
}: StorePhotoGalleryManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadStorePhoto = useUploadStorePhoto(storeId);
  const deleteStorePhoto = useDeleteStorePhoto(storeId);
  const uploadMenu = useUploadMenuPhoto(storeId);
  const deleteMenu = useDeleteMenuPhoto(storeId);

  const { mutate: upload, isPending: isUploading } =
    variant === 'store' ? uploadStorePhoto : uploadMenu;
  const { mutate: remove } = variant === 'store' ? deleteStorePhoto : deleteMenu;
  const confirm = useConfirm();

  const handleSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (!isFileSizeValid(file)) {
        toast.error(fileTooLargeMessage(file));
        continue;
      }
      upload(file, { onError: (err) => toast.error(extractErrorMessage(err)) });
    }
  };

  const handleRemove = async (url: string) => {
    const confirmed = await confirm({
      title: STORE_DIALOG_TEXT.deletePhotoTitle(label),
      description: STORE_DIALOG_TEXT.deletePhotoDescription(label),
      confirmLabel: STORE_DIALOG_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;
    remove(url, { onError: (err) => toast.error(extractErrorMessage(err)) });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{STORE_FORM_TEXT.optionalLabel(label)}</Label>
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
            handleSelected(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <PhotoPreviewGrid
        photos={photos.map(buildFileUrl)}
        alt={label}
        emptyMessage={emptyMessage}
        onRemove={(i) => handleRemove(photos[i])}
        removeAriaLabel={() => `ลบ${label}`}
      />
    </div>
  );
}
