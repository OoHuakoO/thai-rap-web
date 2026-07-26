import { AlertTriangle, Calendar, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NewsType } from '../types/news.types';

export const NEWS_TITLE_MAX_LENGTH = 200;
export const NEWS_DESCRIPTION_MAX_LENGTH = 2000;

export const NEWS_TEXT = {
  pageTitle: 'ข่าวประชาสัมพันธ์',
  pageDescription: 'ประกาศ กิจกรรม และการแจ้งเตือนที่แสดงบนหน้าภาพรวมโครงการ',
  createButton: 'สร้างข่าว',
  editButton: 'แก้ไข',
  deleteButton: 'ลบ',
  typeFilterLabel: 'ประเภทข่าว',
  allTypes: 'ทุกประเภท',
  urgentBadge: 'เร่งด่วน',
  authorPrefix: 'โดย',
  empty: 'ยังไม่มีข่าวประชาสัมพันธ์',
  loadError: 'โหลดข่าวประชาสัมพันธ์ไม่สำเร็จ',
} as const;

export const NEWS_FORM_TEXT = {
  createTitle: 'สร้างข่าวประชาสัมพันธ์',
  editTitle: 'แก้ไขข่าวประชาสัมพันธ์',
  typeLabel: 'ประเภทข่าว',
  typePlaceholder: 'เลือกประเภทข่าว',
  titleLabel: 'หัวข้อข่าว',
  titlePlaceholder: 'เช่น อัปเดตเกณฑ์การประเมินโครงการ ปี 2569',
  descriptionLabel: 'รายละเอียด',
  descriptionPlaceholder: 'เช่น มีผลตั้งแต่วันที่ 18 พ.ค. 2569 เป็นต้นไป',
  urgentLabel: 'ปักหมุดเป็นเรื่องเร่งด่วน',
  urgentHint: 'ข่าวเร่งด่วนจะขึ้นบนสุดของกิจกรรมล่าสุดบนหน้าภาพรวม',
  submitCreate: 'เผยแพร่',
  submitEdit: 'บันทึกการแก้ไข',
  cancel: 'ยกเลิก',
  createSuccess: 'เผยแพร่ข่าวเรียบร้อย',
  updateSuccess: 'บันทึกการแก้ไขเรียบร้อย',
} as const;

export const NEWS_DIALOG_TEXT = {
  deleteTitle: 'ลบข่าวประชาสัมพันธ์',
  deleteDescription: (title: string) => `ต้องการลบ "${title}" ใช่หรือไม่? การลบไม่สามารถกู้คืนได้`,
  deleteConfirmLabel: 'ลบข่าว',
  deleteSuccess: 'ลบข่าวเรียบร้อย',
} as const;

export const NEWS_VALIDATION_MESSAGES = {
  titleRequired: 'กรุณากรอกหัวข้อข่าว',
  titleTooLong: `หัวข้อยาวได้ไม่เกิน ${NEWS_TITLE_MAX_LENGTH} ตัวอักษร`,
  descriptionRequired: 'กรุณากรอกรายละเอียด',
  descriptionTooLong: `รายละเอียดยาวได้ไม่เกิน ${NEWS_DESCRIPTION_MAX_LENGTH} ตัวอักษร`,
  typeRequired: 'กรุณาเลือกประเภทข่าว',
} as const;

export interface NewsTypeDisplay {
  label: string;
  icon: LucideIcon;
  iconBoxClass: string;
  badgeClass: string;
}

// The three categories named in the brief, in the order they are listed there.
export const NEWS_TYPE_DISPLAY: Record<NewsType, NewsTypeDisplay> = {
  GENERAL: {
    label: 'ประชาสัมพันธ์ทั่วไป',
    icon: Megaphone,
    iconBoxClass: 'bg-orange/10 text-orange',
    badgeClass: 'border-orange/20 bg-orange/10 text-orange',
  },
  EVENT: {
    label: 'กิจกรรม',
    icon: Calendar,
    iconBoxClass: 'bg-purple-banner/10 text-purple-banner',
    badgeClass: 'border-purple-banner/20 bg-purple-banner/10 text-purple-banner',
  },
  ALERT: {
    label: 'การแจ้งเตือน',
    icon: AlertTriangle,
    iconBoxClass: 'bg-score-red/10 text-score-red',
    badgeClass: 'border-score-red/20 bg-score-red/10 text-score-red',
  },
};

export const NEWS_TYPE_OPTIONS: readonly { value: NewsType; label: string }[] = (
  Object.keys(NEWS_TYPE_DISPLAY) as NewsType[]
).map((type) => ({ value: type, label: NEWS_TYPE_DISPLAY[type].label }));
