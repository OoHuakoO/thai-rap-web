import { ROLES } from '@/types/auth.types';
import type { CreateUserFormValues } from '../schemas/create-user.schema';

export const CREATE_USER_VALIDATION_MESSAGES = {
  nameMin: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  emailInvalid: 'อีเมลไม่ถูกต้อง',
  phoneInvalid: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก',
} as const;

export const CREATE_USER_ROLE_OPTIONS: { value: CreateUserFormValues['role']; label: string }[] = [
  { value: ROLES.VIEWER, label: 'ผู้ใช้ทั่วไป (User)' },
  { value: ROLES.ENTREPRENEUR, label: 'ผู้ประกอบการ / ร้านค้า' },
  { value: ROLES.MENTOR, label: 'ที่ปรึกษา (Mentor / Coach)' },
  { value: ROLES.ASSESSOR, label: 'ผู้ประเมิน (Assessor)' },
  { value: ROLES.JUDGE, label: 'กรรมการ Pitching' },
  { value: ROLES.ADMIN, label: 'ผู้ดูแลระบบ (Admin / PMO)' },
];

export const CREATE_USER_FORM_TEXT = {
  dialogTitle: 'เพิ่มผู้ใช้งาน',
  dialogDescription: 'สร้างบัญชีใหม่และกำหนดระดับการเข้าถึงข้อมูล',
  errorFallback: 'เกิดข้อผิดพลาด',
  nameLabel: 'ชื่อ-นามสกุล',
  namePlaceholder: 'สมศรี ใจดี',
  emailLabel: 'อีเมล',
  emailPlaceholder: 'example@email.com',
  phoneLabel: 'เบอร์ติดต่อ',
  phonePlaceholder: '0812345678',
  organizationLabel: 'หน่วยงาน / สังกัด',
  organizationPlaceholder: 'มหาวิทยาลัยราชภัฏรำไพพรรณี',
  roleLabel: 'ระดับผู้ใช้',
  rolePlaceholder: 'เลือกระดับผู้ใช้',
  roleHint: 'สิทธิ์ที่ได้รับเป็นไปตามที่ Super Admin กำหนดไว้ในหน้ากำหนดสิทธิ์',
  submit: 'สร้างผู้ใช้งาน',
  submitting: 'กำลังสร้าง...',
  createSuccess: 'สร้างผู้ใช้งานแล้ว',
} as const;
