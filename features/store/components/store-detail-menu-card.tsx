import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { buildFileUrl } from '@/utils/build-file-url';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';

interface StoreDetailMenuCardProps {
  menuPhotos: string[];
  visibleMenuPhotos: string[];
  hiddenMenuPhotosCount: number;
  isCompact: boolean;
  fullDetailHref: string;
  onPreview: (url: string, alt: string) => void;
}

export function StoreDetailMenuCard({
  menuPhotos,
  visibleMenuPhotos,
  hiddenMenuPhotosCount,
  isCompact,
  fullDetailHref,
  onPreview,
}: StoreDetailMenuCardProps) {
  return (
    <Card className="space-y-1.5 p-2.5 shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-charcoal">{STORE_DETAIL_TEXT.menuPhotosTitle}</p>
        {isCompact && menuPhotos.length > 0 && (
          <Link href={fullDetailHref} className="text-[13px] text-orange hover:underline">
            {STORE_DETAIL_TEXT.viewAllLabel}
          </Link>
        )}
      </div>
      {menuPhotos.length > 0 ? (
        <div className="flex min-h-14 flex-wrap items-center gap-2">
          {visibleMenuPhotos.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onPreview(buildFileUrl(url), STORE_DETAIL_TEXT.menuPhotoAlt)}
              aria-label={STORE_DETAIL_TEXT.viewPhotoLabel(STORE_DETAIL_TEXT.menuPhotoAlt)}
              className="h-14 w-14 cursor-pointer overflow-hidden rounded-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={buildFileUrl(url)}
                alt={STORE_DETAIL_TEXT.menuPhotoAlt}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
          {hiddenMenuPhotosCount > 0 && (
            <Link
              href={fullDetailHref}
              className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-muted text-center text-xs font-semibold text-muted-foreground hover:bg-muted/80"
            >
              <span className="text-sm">+{hiddenMenuPhotosCount}</span>
              {STORE_DETAIL_TEXT.viewAllLabel}
            </Link>
          )}
        </div>
      ) : (
        <p className="flex min-h-14 items-center text-[13px] text-muted-foreground">
          {STORE_DETAIL_TEXT.menuPhotosEmpty}
        </p>
      )}
    </Card>
  );
}
