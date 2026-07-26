import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loading } from '@/components/shared/loading';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      {/* useLogin() reads the `?next=` search param, which Next requires to sit
          under a Suspense boundary for this page to prerender. */}
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
