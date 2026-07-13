export const STORE_VALIDATION_MESSAGES = {
  nameRequired: 'กรุณากรอกชื่อร้าน',
  provinceRequired: 'กรุณากรอกจังหวัด',
  storeTypeRequired: 'กรุณากรอกประเภทร้าน',
  ownerNameRequired: 'กรุณากรอกชื่อเจ้าของร้าน',
  phoneRequired: 'กรุณากรอกเบอร์โทร',
  addressRequired: 'กรุณากรอกที่อยู่',
  emailInvalid: 'อีเมลไม่ถูกต้อง',
  avgRevenueNumeric: 'กรอกตัวเลขเท่านั้น',
  avgRevenueRange: 'ยอดขายสูงสุดต้องมากกว่าหรือเท่ากับยอดขายต่ำสุด',
} as const;

// Shared field labels and placeholders used by both create and edit store forms.
export const STORE_FORM_TEXT = {
  nameLabel: 'ชื่อร้าน',
  provinceLabel: 'จังหวัด',
  provincePlaceholder: 'เลือกจังหวัด',
  storeTypeLabel: 'ประเภทร้าน',
  ownerNameLabel: 'เจ้าของร้าน',
  phoneLabel: 'เบอร์โทร',
  emailLabel: 'อีเมล (ไม่บังคับ)',
  avgRevenueLabel: 'ยอดขายเฉลี่ย/เดือน บาท (ไม่บังคับ)',
  avgRevenueRangeSeparator: '–',
  addressLabel: 'ที่อยู่',
  mainProblemsLabel: 'ปัญหาหลักของร้าน (ไม่บังคับ)',
  goalsLabel: 'เป้าหมายการพัฒนา (ไม่บังคับ)',
  tagInputPlaceholder: 'พิมพ์แล้วกด Enter เพื่อเพิ่ม',
  socialLabel: 'โซเชียลมีเดีย (ไม่บังคับ)',
  facebookPlaceholder: 'ลิงก์ Facebook',
  linePlaceholder: 'ลิงก์ LINE',
  instagramPlaceholder: 'ลิงก์ Instagram',
} as const;

export const CREATE_STORE_FORM_TEXT = {
  namePlaceholder: 'ร้านส้มตำป้าแดง',
  storeTypePlaceholder: 'อาหารตามสั่ง',
  ownerNamePlaceholder: 'สมศรี ใจดี',
  phonePlaceholder: '0812345678',
  emailPlaceholder: 'somsri@example.com',
  avgRevenueMinPlaceholder: '15000',
  avgRevenueMaxPlaceholder: '25000',
  addressPlaceholder: '123 หมู่ 4 ต.บางพระ อ.ศรีราชา',
  submit: 'เพิ่มร้าน',
  saving: 'กำลังบันทึก...',
  uploading: 'กำลังอัปโหลดไฟล์...',
  createSuccess: 'เพิ่มร้านอาหารสำเร็จ',
  logoUploadError: (message: string) => `อัปโหลดโลโก้ไม่สำเร็จ: ${message}`,
  storefrontUploadError: (fileName: string, message: string) =>
    `อัปโหลดรูปหน้าร้าน "${fileName}" ไม่สำเร็จ: ${message}`,
  menuUploadError: (fileName: string, message: string) =>
    `อัปโหลดภาพเมนู "${fileName}" ไม่สำเร็จ: ${message}`,
  documentUploadError: (fileName: string, message: string) =>
    `อัปโหลดเอกสาร "${fileName}" ไม่สำเร็จ: ${message}`,
} as const;

export const EDIT_STORE_FORM_TEXT = {
  submit: 'บันทึกการแก้ไข',
  saving: 'กำลังบันทึก...',
  updateSuccess: 'บันทึกข้อมูลร้านสำเร็จ',
} as const;
