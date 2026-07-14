type DocumentKind = 'pdf' | 'spreadsheet' | 'word' | 'image' | 'other';

function classifyDocumentType(fileType: string): DocumentKind {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'spreadsheet';
  if (fileType.includes('word')) return 'word';
  if (fileType.startsWith('image/')) return 'image';
  return 'other';
}

const BADGE_META: Record<DocumentKind, { label: string; className: string }> = {
  pdf: { label: 'PDF', className: 'bg-destructive' },
  spreadsheet: { label: 'XLS', className: 'bg-score-green' },
  word: { label: 'DOC', className: 'bg-blue-600' },
  image: { label: 'IMG', className: 'bg-purple-banner' },
  other: { label: 'FILE', className: 'bg-slate-500' },
};

const ICON_META: Record<DocumentKind, { icon: string; className: string }> = {
  pdf: { icon: '📄', className: 'bg-destructive/10' },
  spreadsheet: { icon: '📊', className: 'bg-score-green/10' },
  word: { icon: '📝', className: 'bg-blue-100' },
  image: { icon: '🖼', className: 'bg-blue-100' },
  other: { icon: '📝', className: 'bg-blue-100' },
};

// Used by store-detail-documents-card.tsx (compact badge with a 3-letter label).
export function getDocumentBadgeMeta(fileType: string): { label: string; className: string } {
  return BADGE_META[classifyDocumentType(fileType)];
}

// Used by store-document-manager.tsx (emoji icon tile).
export function getDocumentIconMeta(fileType: string): { icon: string; className: string } {
  return ICON_META[classifyDocumentType(fileType)];
}
