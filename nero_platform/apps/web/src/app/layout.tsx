import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Neiro Platform - Нейропсихологическая поддержка детей с РАС',
  description: 'Платформа для создания и сопровождения индивидуальных коррекционных маршрутов для детей с расстройствами аутистического спектра',
  keywords: 'аутизм, РАС, нейропсихология, коррекция, дети',
  authors: [{ name: 'Neiro Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#4F46E5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

