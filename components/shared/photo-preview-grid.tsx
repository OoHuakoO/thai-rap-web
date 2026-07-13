'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PhotoPreviewGridProps {
  photos: string[];
  alt: string;
  emptyMessage: string;
  onRemove: (index: number) => void;
  removeAriaLabel: (index: number) => string;
}

export function PhotoPreviewGrid({
  photos,
  alt,
  emptyMessage,
  onRemove,
  removeAriaLabel,
}: PhotoPreviewGridProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (photos.length === 0) {
    return <p className="text-[10.5px] text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={url} className="group relative h-16 w-16">
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(url);
                setIsPreviewOpen(true);
              }}
              aria-label={`ดู${alt}`}
              className="block h-full w-full cursor-pointer overflow-hidden rounded-md border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={alt} className="h-full w-full object-cover" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
              aria-label={removeAriaLabel(i)}
              className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-white shadow-sm group-hover:flex"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl p-2">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={alt}
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
