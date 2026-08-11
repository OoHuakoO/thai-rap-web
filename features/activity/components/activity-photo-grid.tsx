'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ACTIVITY_DETAIL_TEXT,
  ACTIVITY_DIALOG_TEXT,
  ACTIVITY_TEXT,
} from '../constants/activity.constants';
import { ActivityPhotoLightbox } from './activity-photo-lightbox';

export interface ActivityPhotoGridItem {
  /** Stable key — the photo id on a saved album, the object URL on a buffered file. */
  id: string;
  /** What the `<img>` loads: an object URL before upload, a server URL after. */
  src: string;
}

interface ActivityPhotoGridProps {
  photos: ActivityPhotoGridItem[];
  /** Alt text and lightbox title — a photo carries no label of its own. */
  alt: string;
  onRemove: (index: number) => void;
}

/**
 * The thumbnail strip both upload shapes render. It is shared rather than
 * per-shape so a buffered photo on the create form and a saved one on the edit
 * form are the same size — they are the same thing to the user, and the shared
 * `PhotoPreviewGrid` the picker used draws a 64px tile against this one's 128px.
 */
export function ActivityPhotoGrid({ photos, alt, onRemove }: ActivityPhotoGridProps) {
  const [openSrc, setOpenSrc] = useState<string | null>(null);

  if (photos.length === 0) {
    return <p className="text-xs text-muted-foreground">{ACTIVITY_TEXT.noPhotoLabel}</p>;
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <li key={photo.id} className="relative">
            <button
              type="button"
              onClick={() => setOpenSrc(photo.src)}
              aria-label={ACTIVITY_DETAIL_TEXT.viewPhotoLabel(index)}
              className="block w-full overflow-hidden rounded-md border bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={alt}
                className="h-32 w-full object-cover transition-transform hover:scale-105"
              />
            </button>
            {/* Always visible, never hover-only: a hover-gated control cannot be
                reached on a touch screen. */}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-1.5 top-1.5 h-7 w-7 bg-card/90 shadow-sm"
              aria-label={ACTIVITY_DIALOG_TEXT.deletePhotoAriaLabel(index)}
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>

      <ActivityPhotoLightbox src={openSrc} onClose={() => setOpenSrc(null)} label={alt} />
    </>
  );
}
