import type { Metadata } from 'next';
import './globals.css';
import { inter, sarabun } from '@/styles/fonts';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Thai Rap',
  description: 'Production-ready Next.js application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${sarabun.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
