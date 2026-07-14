// Text shared by the cover/photo/document upload components (picker + manager shapes).

export const STORE_MEDIA_TEXT = {
  sectionTitle: 'รูปภาพและเอกสาร',
  attachDescription: 'แนบรูปร้านค้า เมนู และเอกสารประกอบร้าน',
  coverAlt: 'หน้าปกร้าน',
  addPhotoLabel: 'เพิ่มรูป',
  attachFileLabel: 'แนบไฟล์',
  uploadingLabel: 'กำลังอัปโหลด...',
  photoEmptyMessage: 'ยังไม่มีรูป',
  storePhotoManagerEmptyMessage: 'ยังไม่มีรูปร้านค้า',
  documentAttachEmptyMessage: 'ยังไม่มีเอกสารแนบ',
  documentUploadedEmptyMessage: 'ยังไม่มีเอกสารอัปโหลด',
  removePhotoAriaLabel: (index: number) => `ลบรูป ${index + 1}`,
  removeFileAriaLabel: (fileName: string) => `ลบไฟล์ ${fileName}`,
  removeDocumentAriaLabel: (fileName: string) => `ลบเอกสาร ${fileName}`,
  removeLabeledPhotoAriaLabel: (label: string) => `ลบ${label}`,
} as const;
