// Mirrors the @MaxLength decorators on CreateActivityDto in thai-rap-api —
// change both together or the form accepts what the API 422s.
export const ACTIVITY_TITLE_MAX_LENGTH = 200;
export const ACTIVITY_DESCRIPTION_MAX_LENGTH = 5000;
export const ACTIVITY_NOTE_MAX_LENGTH = 2000;
export const ACTIVITY_LOCATION_MAX_LENGTH = 200;

// Matches FilesInterceptor('files', 20) on POST /activities/:id/photos.
export const ACTIVITY_PHOTO_MAX_PER_UPLOAD = 20;

export const ACTIVITY_PAGE_SIZE = 12;

export const ACTIVITY_TEXT = {
  pageTitle: 'ประมวลภาพกิจกรรม',
  pageDescription: 'ภาพและรายละเอียดกิจกรรมของโครงการ',
  createButton: 'เพิ่มกิจกรรม',
  editButton: 'แก้ไข',
  deleteButton: 'ลบ',
  searchLabel: 'ค้นหากิจกรรม',
  searchPlaceholder: 'ค้นหาจากชื่อกิจกรรมหรือสถานที่',
  photoCount: (count: number) => `${count} ภาพ`,
  noPhotoLabel: 'ยังไม่มีภาพ',
  empty: 'ยังไม่มีประมวลภาพกิจกรรม',
  emptySearch: 'ไม่พบกิจกรรมที่ค้นหา',
  loadError: 'โหลดประมวลภาพกิจกรรมไม่สำเร็จ',
  itemLabel: 'กิจกรรม',
  backToList: 'กลับไปหน้าประมวลภาพกิจกรรม',
} as const;

export const ACTIVITY_DETAIL_TEXT = {
  descriptionLabel: 'รายละเอียดกิจกรรม',
  noteLabel: 'หมายเหตุ',
  locationLabel: 'สถานที่',
  dateLabel: 'วันที่จัดกิจกรรม',
  photosLabel: 'ภาพกิจกรรม',
  createdByPrefix: 'บันทึกโดย',
  photoEmpty: 'ยังไม่มีภาพกิจกรรม',
  viewPhotoLabel: (index: number) => `ดูภาพที่ ${index + 1}`,
} as const;

export const ACTIVITY_FORM_TEXT = {
  createTitle: 'เพิ่มกิจกรรม',
  editTitle: 'แก้ไขกิจกรรม',
  titleLabel: 'ชื่อกิจกรรม',
  titlePlaceholder: 'เช่น ค่ายอบรมผู้ประกอบการ รุ่นที่ 1',
  descriptionLabel: 'รายละเอียดกิจกรรม',
  descriptionPlaceholder: 'เช่น อบรมเข้มข้น 3 วัน ด้านการเงินและการตลาดสำหรับร้านอาหาร',
  activityDateLabel: 'วันที่จัดกิจกรรม',
  locationLabel: 'สถานที่จัดกิจกรรม',
  locationPlaceholder: 'เช่น โรงแรมเซ็นทรา ศูนย์ราชการ กรุงเทพฯ',
  noteLabel: 'หมายเหตุ',
  notePlaceholder: 'เช่น ผู้เข้าร่วม 48 ร้าน จาก 12 จังหวัด',
  optionalSuffix: '(ไม่บังคับ)',
  photoSectionLabel: 'ภาพกิจกรรม',
  photoSectionHint: `อัปโหลดได้ครั้งละไม่เกิน ${ACTIVITY_PHOTO_MAX_PER_UPLOAD} ภาพ (jpg, png, webp)`,
  addPhotoLabel: 'เพิ่มภาพ',
  uploadingLabel: 'กำลังอัปโหลด...',
  submitCreate: 'บันทึกกิจกรรม',
  submitEdit: 'บันทึกการแก้ไข',
  cancel: 'ยกเลิก',
  createSuccess: 'บันทึกกิจกรรมเรียบร้อย',
  updateSuccess: 'บันทึกการแก้ไขเรียบร้อย',
  photoUploadSuccess: 'อัปโหลดภาพเรียบร้อย',
  photoUploadError: (count: number, message: string) => `อัปโหลด ${count} ภาพไม่สำเร็จ: ${message}`,
  photoLimitExceeded: (skipped: number) =>
    `เลือกได้ครั้งละไม่เกิน ${ACTIVITY_PHOTO_MAX_PER_UPLOAD} ภาพ — ข้ามไป ${skipped} ภาพ`,
} as const;

export const ACTIVITY_DIALOG_TEXT = {
  deleteTitle: 'ลบกิจกรรม',
  deleteDescription: (title: string) =>
    `ต้องการลบ "${title}" พร้อมภาพทั้งหมดใช่หรือไม่? การลบไม่สามารถกู้คืนได้`,
  deleteConfirmLabel: 'ลบกิจกรรม',
  deleteSuccess: 'ลบกิจกรรมเรียบร้อย',
  deletePhotoTitle: 'ลบภาพกิจกรรม',
  deletePhotoDescription: 'ต้องการลบภาพนี้ใช่หรือไม่? การลบไม่สามารถกู้คืนได้',
  deletePhotoConfirmLabel: 'ลบภาพ',
  deletePhotoAriaLabel: (index: number) => `ลบภาพที่ ${index + 1}`,
  deletePhotoSuccess: 'ลบภาพเรียบร้อย',
} as const;

export const ACTIVITY_VALIDATION_MESSAGES = {
  titleRequired: 'กรุณากรอกชื่อกิจกรรม',
  titleTooLong: `ชื่อกิจกรรมยาวได้ไม่เกิน ${ACTIVITY_TITLE_MAX_LENGTH} ตัวอักษร`,
  descriptionRequired: 'กรุณากรอกรายละเอียดกิจกรรม',
  descriptionTooLong: `รายละเอียดยาวได้ไม่เกิน ${ACTIVITY_DESCRIPTION_MAX_LENGTH} ตัวอักษร`,
  activityDateRequired: 'กรุณาเลือกวันที่จัดกิจกรรม',
  locationTooLong: `สถานที่ยาวได้ไม่เกิน ${ACTIVITY_LOCATION_MAX_LENGTH} ตัวอักษร`,
  noteTooLong: `หมายเหตุยาวได้ไม่เกิน ${ACTIVITY_NOTE_MAX_LENGTH} ตัวอักษร`,
} as const;
