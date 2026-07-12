export const AUTH_VALIDATION_MESSAGES = {
  emailInvalid: 'อีเมลไม่ถูกต้อง',
  loginPasswordMin: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  nameMin: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  registerPasswordMin: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  roleRequired: 'กรุณาเลือกบทบาท',
  passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
} as const;

export const AUTH_BRAND = 'Thai Rap';

export const LOGIN_FORM_TEXT = {
  brand: AUTH_BRAND,
  title: 'เข้าสู่ระบบ',
  description: 'กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ',
  emailLabel: 'อีเมล',
  emailPlaceholder: 'example@email.com',
  passwordLabel: 'รหัสผ่าน',
  passwordPlaceholder: '••••••••',
  submit: 'เข้าสู่ระบบ',
  submitting: 'กำลังเข้าสู่ระบบ...',
  noAccountPrompt: 'ยังไม่มีบัญชี?',
  registerLink: 'สมัครสมาชิก',
} as const;

export const REGISTER_FORM_TEXT = {
  brand: AUTH_BRAND,
  title: 'สมัครสมาชิก',
  description: 'กรอกข้อมูลเพื่อสร้างบัญชีใหม่',
  nameLabel: 'ชื่อ',
  namePlaceholder: 'สมศรี ใจดี',
  emailLabel: 'อีเมล',
  emailPlaceholder: 'example@email.com',
  roleLabel: 'บทบาท',
  rolePlaceholder: 'เลือกบทบาท',
  passwordLabel: 'รหัสผ่าน',
  passwordPlaceholder: '••••••••',
  confirmPasswordLabel: 'ยืนยันรหัสผ่าน',
  confirmPasswordPlaceholder: '••••••••',
  submit: 'สมัครสมาชิก',
  submitting: 'กำลังสมัครสมาชิก...',
  hasAccountPrompt: 'มีบัญชีแล้ว?',
  loginLink: 'เข้าสู่ระบบ',
} as const;
