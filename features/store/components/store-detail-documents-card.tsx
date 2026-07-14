import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { buildFileUrl } from '@/utils/build-file-url';
import { formatFileSize } from '@/utils/format-file-size';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';
import { getDocumentBadgeMeta } from '../utils/document-visuals';
import type { StoreDocument } from '../types/store.types';

interface StoreDetailDocumentsCardProps {
  documents: StoreDocument[];
  visibleDocs: StoreDocument[];
  hiddenDocsCount: number;
  isCompact: boolean;
  fullDetailHref: string;
}

export function StoreDetailDocumentsCard({
  documents,
  visibleDocs,
  hiddenDocsCount,
  isCompact,
  fullDetailHref,
}: StoreDetailDocumentsCardProps) {
  return (
    <Card className="space-y-1.5 p-2.5 shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-charcoal">{STORE_DETAIL_TEXT.documentsTitle}</p>
        {isCompact && documents.length > 0 && (
          <Link href={fullDetailHref} className="text-[13px] text-orange hover:underline">
            {STORE_DETAIL_TEXT.viewAllLabel}
          </Link>
        )}
      </div>
      {documents.length > 0 ? (
        <div className="flex min-h-14 flex-wrap items-center gap-2">
          {visibleDocs.map((doc) => {
            const { label, className } = getDocumentBadgeMeta(doc.fileType);
            return (
              <div key={doc.id} className="w-14 text-center">
                <a href={buildFileUrl(doc.url)} target="_blank" rel="noreferrer">
                  <div
                    className={`mx-auto flex h-12 w-10 items-center justify-center rounded-md text-[11px] font-bold text-white ${className}`}
                  >
                    {label}
                  </div>
                </a>
                <p
                  className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-muted-foreground"
                  title={`${doc.filename} (${formatFileSize(doc.fileSize)})`}
                >
                  {doc.filename}
                </p>
              </div>
            );
          })}
          {hiddenDocsCount > 0 && (
            <Link
              href={fullDetailHref}
              className="flex h-12 w-10 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80"
            >
              +{hiddenDocsCount}
            </Link>
          )}
        </div>
      ) : (
        <p className="flex min-h-14 items-center text-[13px] text-muted-foreground">
          {STORE_DETAIL_TEXT.documentsEmpty}
        </p>
      )}
    </Card>
  );
}
