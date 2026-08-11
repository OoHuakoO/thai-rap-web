'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ACTIVITY_FORM_TEXT } from '../constants/activity.constants';
import { filterValidPhotos } from '../utils/filter-valid-photos';
import { ActivityPhotoGrid } from './activity-photo-grid';

interface ActivityPhotoPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
}

/** Picker shape — the album does not exist yet, so files are held until the create mutation succeeds. */
export function ActivityPhotoPicker({ files, onChange }: ActivityPhotoPickerProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <Label>{ACTIVITY_FORM_TEXT.photoSectionLabel}</Label>
        <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border bg-card px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:border-orange hover:text-orange">
          <Plus className="h-3 w-3" />
          {ACTIVITY_FORM_TEXT.addPhotoLabel}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                onChange([
                  ...files,
                  ...filterValidPhotos(Array.from(e.target.files), files.length),
                ]);
              }
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <p className="text-xs text-charcoal">{ACTIVITY_FORM_TEXT.photoSectionHint}</p>

      {/* The object URL doubles as the key: it is unique per buffered file and
          replaced wholesale whenever the selection changes. */}
      <ActivityPhotoGrid
        photos={previews.map((src) => ({ id: src, src }))}
        alt={ACTIVITY_FORM_TEXT.photoSectionLabel}
        onRemove={(index) => onChange(files.filter((_, i) => i !== index))}
      />
    </div>
  );
}
