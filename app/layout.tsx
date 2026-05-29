import type { Metadata } from 'next';
import './globals.css';
import { inter, sarabun } from '@/styles/fonts';
import { Providers } from './providers';
import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';

export const metadata: Metadata = {
  title: 'Thai Rap',
  description: 'Production-ready Next.js application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${sarabun.variable} font-sans`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopHeader />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
