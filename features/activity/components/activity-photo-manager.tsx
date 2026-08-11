'use client';

import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { Label } from '@/components/ui/label';
import { buildFileUrl } from '@/utils/build-file-url';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACTIVITY_DIALOG_TEXT, ACTIVITY_FORM_TEXT } from '../constants/activity.constants';
import { useDeleteActivityPhoto } from '../hooks/use-delete-activity-photo';
import { useUploadActivityPhotos } from '../hooks/use-upload-activity-photos';
import type { ActivityPhoto } from '../types/activity.types';
import { filterValidPhotos } from '../utils/filter-valid-photos';
import { ActivityPhotoGrid } from './activity-photo-grid';

interface ActivityPhotoManagerProps {
  activityId: string;
  photos: ActivityPhoto[];
}

/** Manager shape — the album already has an id, so a selected file uploads straight away. */
export function ActivityPhotoManager({ activityId, photos }: ActivityPhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();

  const { mutate: uploadPhotos, isPending: isUploading } = useUploadActivityPhotos(activityId);
  const { mutate: deletePhoto } = useDeleteActivityPhoto(activityId);

  const handleSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = filterValidPhotos(Array.from(fileList));
    if (files.length === 0) return;

    uploadPhotos(files, {
      onSuccess: () => toast.success(ACTIVITY_FORM_TEXT.photoUploadSuccess),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const handleDelete = async (photo: ActivityPhoto) => {
    const confirmed = await confirm({
      title: ACTIVITY_DIALOG_TEXT.deletePhotoTitle,
      description: ACTIVITY_DIALOG_TEXT.deletePhotoDescription,
      confirmLabel: ACTIVITY_DIALOG_TEXT.deletePhotoConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;

    deletePhoto(photo.id, {
      onSuccess: () => toast.success(ACTIVITY_DIALOG_TEXT.deletePhotoSuccess),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <Label>{ACTIVITY_FORM_TEXT.photoSectionLabel}</Label>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded border border-dashed border-border bg-card px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          {isUploading ? ACTIVITY_FORM_TEXT.uploadingLabel : ACTIVITY_FORM_TEXT.addPhotoLabel}
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
      <p className="text-xs text-charcoal">{ACTIVITY_FORM_TEXT.photoSectionHint}</p>

      <ActivityPhotoGrid
        photos={photos.map((photo) => ({ id: photo.id, src: buildFileUrl(photo.url) }))}
        alt={ACTIVITY_FORM_TEXT.photoSectionLabel}
        onRemove={(index) => handleDelete(photos[index])}
      />
    </div>
  );
}
