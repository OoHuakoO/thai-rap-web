// Mirrors ASSESSMENT_EVIDENCE_MIME_REGEX and ASSESSMENT_EVIDENCE_ALLOWED_EXTENSIONS
// in the API's common/constants/file-upload.const.ts. The API extension
// whitelist is the real gate — offering .docx/.csv here only let the user pick
// a file the upload would then reject.
export const EVIDENCE_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf,.xlsx';

// The store picker lists every store in one popover rather than paginating it.
export const STORE_PICKER_PAGE_SIZE = 100;
