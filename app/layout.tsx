import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME } from '@/constants';
import { inter, sarabun } from '@/styles/fonts';
import { Providers } from './providers';

export const metadata: Metadata = {
  // `template` appends the app name to every child page's title, so pages
  // export only their own name instead of repeating the suffix in each file.
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'ระบบประเมินและติดตามศักยภาพร้านอาหารในโครงการ Thai Rap',
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
