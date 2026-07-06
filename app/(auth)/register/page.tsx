import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'สมัครสมาชิก | Thai Rap',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <RegisterForm />
    </div>
  )
}
