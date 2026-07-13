'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size';
import { STORE_FORM_TEXT } from '../constants/store-form.constants';

interface StoreCoverPickerProps {
  coverFile: File | null;
  onCoverChange: (file: File | null) => void;
}

export function StoreCoverPicker({ coverFile, onCoverChange }: StoreCoverPickerProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  return (
    <div className="flex flex-shrink-0 flex-col items-center gap-2 rounded-xl border-2 border-dashed border-orange/30 bg-orange/5 p-4 sm:w-72">
      <Label className="text-center">{STORE_FORM_TEXT.coverLabel}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-card bg-muted shadow-md ring-2 ring-orange/20"
      >
        {coverPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview} alt="หน้าปกร้าน" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-7 w-7 text-muted-foreground" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
          <Camera className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (isFileSizeValid(file)) onCoverChange(file);
              else toast.error(fileTooLargeMessage(file));
            }
            e.target.value = '';
          }}
        />
      </button>
    </div>
  );
}
