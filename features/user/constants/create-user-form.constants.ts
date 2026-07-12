import type { CreateUserFormValues } from '../schemas/create-user.schema';

export const CREATE_USER_VALIDATION_MESSAGES = {
  nameMin: 'Name must be at least 2 characters',
  emailInvalid: 'Invalid email address',
} as const;

export const CREATE_USER_ROLE_OPTIONS: { value: CreateUserFormValues['role']; label: string }[] = [
  { value: 'ENTREPRENEUR', label: 'ผู้ประกอบการ' },
  { value: 'ASSESSOR', label: 'ผู้ประเมิน (Assessor)' },
  { value: 'MENTOR', label: 'ที่ปรึกษา (Mentor / Coach)' },
  { value: 'JUDGE', label: 'กรรมการ Pitching' },
  { value: 'ME_TEAM', label: 'ทีม M&E' },
  { value: 'ADMIN', label: 'ผู้ดูแลระบบ (Admin / PMO)' },
];

export const CREATE_USER_FORM_TEXT = {
  errorFallback: 'เกิดข้อผิดพลาด',
  nameLabel: 'ชื่อ',
  namePlaceholder: 'John Doe',
  emailLabel: 'อีเมล',
  emailPlaceholder: 'john@example.com',
  roleLabel: 'บทบาท',
  rolePlaceholder: 'เลือกบทบาท',
  submit: 'สร้างผู้ใช้งาน',
  submitting: 'กำลังสร้าง...',
} as const;
