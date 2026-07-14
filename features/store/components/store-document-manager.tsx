'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { buildFileUrl } from '@/utils/build-file-url';
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size';
import { formatFileSize } from '@/utils/format-file-size';
import { STORE_DIALOG_TEXT } from '../constants/store-dialog.constants';
import { STORE_FORM_TEXT } from '../constants/store-form.constants';
import { STORE_MEDIA_TEXT } from '../constants/store-media.constants';
import { useUploadStoreDocument, useDeleteStoreDocument } from '../hooks/use-stores';
import { getDocumentIconMeta } from '../utils/document-visuals';
import type { StoreDocument } from '../types/store.types';

interface StoreDocumentManagerProps {
  storeId: string;
  documents: StoreDocument[];
}

export function StoreDocumentManager({ storeId, documents }: StoreDocumentManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadDocument, isPending: isUploading } = useUploadStoreDocument(storeId);
  const { mutate: deleteDocument } = useDeleteStoreDocument(storeId);
  const confirm = useConfirm();

  const handleSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (!isFileSizeValid(file)) {
        toast.error(fileTooLargeMessage(file));
        continue;
      }
      uploadDocument(file, { onError: (err) => toast.error(extractErrorMessage(err)) });
    }
  };

  const handleDeleteDocument = async (doc: StoreDocument) => {
    const confirmed = await confirm({
      title: STORE_DIALOG_TEXT.deleteDocumentTitle,
      description: STORE_DIALOG_TEXT.deleteDocumentDescription(doc.filename),
      confirmLabel: STORE_DIALOG_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    });
    if (!confirmed) return;
    deleteDocument(doc.id, { onError: (err) => toast.error(extractErrorMessage(err)) });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{STORE_FORM_TEXT.documentsLabel}</Label>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded border border-dashed border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground hover:border-orange hover:text-orange disabled:opacity-50"
        >
          <Upload className="h-2.5 w-2.5" />
          {isUploading ? STORE_MEDIA_TEXT.uploadingLabel : STORE_MEDIA_TEXT.attachFileLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.xlsx,.docx,.csv"
          className="hidden"
          onChange={(e) => {
            handleSelected(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {documents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {documents.map((doc) => {
            const { icon, className } = getDocumentIconMeta(doc.fileType);
            return (
              <div key={doc.id} className="group relative w-16 text-center">
                <a href={buildFileUrl(doc.url)} target="_blank" rel="noreferrer">
                  <div
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md text-base ${className}`}
                  >
                    {icon}
                  </div>
                </a>
                <p
                  className="mt-0.5 truncate text-[8.5px] text-muted-foreground"
                  title={`${doc.filename} (${formatFileSize(doc.fileSize)})`}
                >
                  {doc.filename}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(doc)}
                  aria-label={STORE_MEDIA_TEXT.removeDocumentAriaLabel(doc.filename)}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[10.5px] text-muted-foreground">
          {STORE_MEDIA_TEXT.documentUploadedEmptyMessage}
        </p>
      )}
    </div>
  );
}
