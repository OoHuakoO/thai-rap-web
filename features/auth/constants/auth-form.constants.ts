export const AUTH_VALIDATION_MESSAGES = {
  emailInvalid: 'อีเมลไม่ถูกต้อง',
  loginPasswordMin: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  nameMin: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  registerPasswordMin: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  roleRequired: 'กรุณาเลือกบทบาท',
  passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
  otpLength: 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก',
} as const;

export const OTP_LENGTH = 6;

// The API throttles /auth/forgot-password to 3 requests per minute; the button
// stays locked long enough that a user can't walk into a 429.
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const AUTH_BRAND = 'Thai Rap';

export const LOGIN_FORM_TEXT = {
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
  forgotPasswordLink: 'ลืมรหัสผ่าน?',
} as const;

export const FORGOT_PASSWORD_FORM_TEXT = {
  title: 'ลืมรหัสผ่าน',
  emailStepDescription: 'กรอกอีเมลที่ใช้สมัคร ระบบจะส่งรหัส OTP ไปให้',
  otpStepDescription: (email: string) => `กรอกรหัส OTP 6 หลักที่ส่งไปยัง ${email}`,
  passwordStepDescription: 'ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ',

  emailLabel: 'อีเมล',
  emailPlaceholder: 'example@email.com',
  sendOtp: 'ส่งรหัส OTP',
  sendingOtp: 'กำลังส่งรหัส OTP...',

  otpLabel: 'รหัส OTP',
  otpPlaceholder: '000000',
  otpSentNotice: 'หากอีเมลนี้มีอยู่ในระบบ คุณจะได้รับรหัส OTP ภายในไม่กี่นาที',
  verifyOtp: 'ยืนยันรหัส OTP',
  verifyingOtp: 'กำลังยืนยัน...',
  resendOtp: 'ส่งรหัสใหม่อีกครั้ง',
  resendCountdown: (seconds: number) => `ส่งรหัสใหม่ได้ใน ${seconds} วินาที`,
  changeEmail: 'เปลี่ยนอีเมล',

  passwordLabel: 'รหัสผ่านใหม่',
  passwordPlaceholder: '••••••••',
  confirmPasswordLabel: 'ยืนยันรหัสผ่านใหม่',
  confirmPasswordPlaceholder: '••••••••',
  submitPassword: 'ตั้งรหัสผ่านใหม่',
  submittingPassword: 'กำลังบันทึก...',

  successTitle: 'ตั้งรหัสผ่านใหม่เรียบร้อย',
  successDescription: 'เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย',
  backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
} as const;

export const REGISTER_FORM_TEXT = {
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
  pendingTitle: 'สมัครสมาชิกเรียบร้อย',
  pendingDescription: 'บัญชีของคุณรอการอนุมัติ',
  pendingMessage:
    'ผู้ดูแลระบบสูงสุดจะตรวจสอบและอนุมัติบัญชีของคุณ เมื่ออนุมัติแล้วจึงจะเข้าสู่ระบบได้',
  pendingBackToLogin: 'ไปหน้าเข้าสู่ระบบ',
} as const;
