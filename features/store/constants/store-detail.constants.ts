// Display text and labels for the store detail page.

export const STORE_DETAIL_TEXT = {
  notFound: 'ไม่พบร้านนี้',
  editStoreTitle: 'แก้ไขร้าน',

  contactInfoTitle: 'ข้อมูลติดต่อ',
  ownerNameLabel: 'เจ้าของร้าน',
  phoneLabel: 'เบอร์โทร',
  emailLabel: 'อีเมล',
  emailEmpty: 'ยังไม่ระบุ',
  addressLabel: 'ที่อยู่',
  avgRevenueLabel: 'ยอดขายเฉลี่ย/เดือน',
  avgRevenueRangeSeparator: '–',
  avgRevenueEmpty: 'ยังไม่ระบุ',
  currencyUnit: 'บาท',

  onlineChannelsLabel: 'ช่องทางออนไลน์',
  onlineChannelsEmpty: 'ยังไม่มีช่องทางออนไลน์',
  viewMoreLabel: 'ดูเพิ่มเติม',
  viewAllLabel: 'ดูทั้งหมด',
  facebookTitle: 'Facebook',
  lineTitle: 'LINE',
  instagramTitle: 'Instagram',

  mainProblemsTitle: 'ปัญหาสำคัญ',
  mainProblemsEmpty: 'ยังไม่มีข้อมูลปัญหาสำคัญ',
  goalsTitle: 'เป้าหมายการพัฒนา',
  goalsEmpty: 'ยังไม่มีข้อมูลเป้าหมายการพัฒนา',

  storefrontPhotosTitle: 'รูปหน้าร้าน',
  storefrontPhotoAlt: 'รูปหน้าร้าน',
  storefrontGalleryEmpty: 'ยังไม่มีรูปเพิ่มเติม',

  documentsTitle: 'เอกสารที่อัปโหลด',
  documentsEmpty: 'ยังไม่มีเอกสารอัปโหลด',

  menuPhotosTitle: 'ภาพเมนูอาหาร',
  menuPhotoAlt: 'ภาพเมนูอาหาร',
  menuPhotosEmpty: 'ยังไม่มีภาพเมนูอาหาร',

  progressStatusTitle: 'สถานะการเข้าร่วมโครงการ',
  assessmentSectionTitle: 'ประเมินร้าน',

  timelineRegistered: 'ลงทะเบียนร้านอาหาร',
  timelineT0: 'ประเมิน T0',
  timelineT1: 'ประเมิน T1',
  timelinePendingResult: 'รอประกาศผลการคัดเลือก',
} as const;

export const ASSESSMENT_ROUND_LABELS = [
  { round: 'T0', label: 'T0 — ก่อนเข้าค่าย' },
  { round: 'T1', label: 'T1 — หลังค่าย' },
  { round: 'T2', label: 'T2 — Field Audit' },
  { round: 'T3', label: 'T3 — ติดตาม 1 เดือน' },
  { round: 'T4', label: 'T4 — ติดตาม 3 เดือน' },
] as const;
