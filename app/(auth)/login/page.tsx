import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | Thai Rap',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <LoginForm />
    </div>
  )
}
