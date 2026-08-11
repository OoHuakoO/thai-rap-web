import { Store as StoreIcon } from 'lucide-react';
import { buildFileUrl } from '@/utils/build-file-url';
import { cn } from '@/utils/cn';

type PitchingStoreThumbnailSize = 'sm' | 'lg';

const SIZE_CLASSES: Record<PitchingStoreThumbnailSize, { frame: string; icon: string }> = {
  sm: { frame: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  lg: { frame: 'h-20 w-20 rounded-2xl shadow-sm', icon: 'h-7 w-7' },
};

interface PitchingStoreThumbnailProps {
  /** Already-uploaded path; run through `buildFileUrl`, never an object URL. */
  coverUrl: string | null;
  alt: string;
  size: PitchingStoreThumbnailSize;
}

/** A store's cover photo, falling back to the house icon when there is none. */
export function PitchingStoreThumbnail({ coverUrl, alt, size }: PitchingStoreThumbnailProps) {
  const style = SIZE_CLASSES[size];

  return (
    <span
      className={cn(
        'flex flex-shrink-0 items-center justify-center overflow-hidden border border-orange/15 bg-cream',
        style.frame
      )}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={buildFileUrl(coverUrl)} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <StoreIcon className={cn('text-orange/50', style.icon)} />
      )}
    </span>
  );
}
