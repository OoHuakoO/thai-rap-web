import Link from 'next/link';
import { Store as StoreIcon } from 'lucide-react';
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge';
import { buildFileUrl } from '@/utils/build-file-url';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';

interface StoreCoverGalleryStripProps {
  storeName: string;
  coverPhoto: string | null;
  statusVariant: StatusVariant;
  statusLabel: string;
  stripPhotos: string[];
  visibleStrip: string[];
  hiddenStripCount: number;
  fullDetailHref: string;
  onPreview: (url: string, alt: string) => void;
}

export function StoreCoverGalleryStrip({
  storeName,
  coverPhoto,
  statusVariant,
  statusLabel,
  stripPhotos,
  visibleStrip,
  hiddenStripCount,
  fullDetailHref,
  onPreview,
}: StoreCoverGalleryStripProps) {
  return (
    <>
      <div className="relative h-40 overflow-hidden rounded-xl">
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildFileUrl(coverPhoto)}
            alt={storeName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <StoreIcon className="h-12 w-12 text-muted-foreground/60" />
          </div>
        )}
        <StatusBadge
          status={statusVariant}
          label={statusLabel}
          className="absolute right-2 top-2 bg-white/90 text-sm shadow-sm backdrop-blur-sm"
        />
      </div>

      {/* Store photo gallery strip — always reserves its row so card height stays
      consistent whether or not a store has extra menuPhotos beyond the cover. */}
      <div className="mt-2">
        <div className="flex min-h-14 flex-wrap items-center gap-2">
          {stripPhotos.length > 0 ? (
            <>
              {visibleStrip.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => onPreview(buildFileUrl(url), STORE_DETAIL_TEXT.storePhotoAlt)}
                  aria-label={STORE_DETAIL_TEXT.viewPhotoLabel(STORE_DETAIL_TEXT.storePhotoAlt)}
                  className="h-14 w-20 cursor-pointer overflow-hidden rounded-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildFileUrl(url)}
                    alt={STORE_DETAIL_TEXT.storePhotoAlt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              {hiddenStripCount > 0 && (
                <Link
                  href={fullDetailHref}
                  className="flex h-14 w-20 flex-col items-center justify-center rounded-lg bg-muted text-center text-xs font-semibold text-muted-foreground hover:bg-muted/80"
                >
                  <span className="text-sm">+{hiddenStripCount}</span>
                  {STORE_DETAIL_TEXT.viewAllLabel}
                </Link>
              )}
            </>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {STORE_DETAIL_TEXT.storePhotoGalleryEmpty}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
