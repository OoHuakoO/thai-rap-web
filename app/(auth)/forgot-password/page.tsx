import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'ลืมรหัสผ่าน',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <ForgotPasswordForm />
    </div>
  );
}
