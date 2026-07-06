import { z } from 'zod'

export const REGISTERABLE_ROLES = ['ENTREPRENEUR', 'ASSESSOR', 'MENTOR', 'JUDGE', 'ME_TEAM'] as const

export const registerSchema = z
  .object({
    name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string(),
    role: z.enum(REGISTERABLE_ROLES, { errorMap: () => ({ message: 'กรุณาเลือกบทบาท' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
