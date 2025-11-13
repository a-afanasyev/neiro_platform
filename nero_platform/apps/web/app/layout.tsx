/**
 * Root Layout для Next.js приложения
 * 
 * Основной layout со всеми провайдерами
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Neiro Platform - Нейропсихологическое сопровождение детей',
  description:
    'Комплексная платформа для нейропсихологического сопровождения детей с РАС',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

