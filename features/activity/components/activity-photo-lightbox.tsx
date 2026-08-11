'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ActivityPhotoLightboxProps {
  /**
   * What to show; `null` closes the dialog. A ready-to-render url rather than a
   * photo record — the create form enlarges a buffered file's object URL, which
   * has no record behind it yet.
   */
  src: string | null;
  onClose: () => void;
  /** Alt text and dialog title — a photo carries no label of its own. */
  label: string;
}

/**
 * Wider than the store's photo preview (`max-w-2xl`): an activity album is read
 * as a set, so the photo is the page's subject rather than one field of a record.
 */
export function ActivityPhotoLightbox({ src, onClose, label }: ActivityPhotoLightboxProps) {
  return (
    <Dialog open={src !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-2">
        <DialogTitle className="sr-only">{label}</DialogTitle>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="max-h-[75vh] w-full rounded-md object-contain" />
        )}
      </DialogContent>
    </Dialog>
  );
}
