import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LocaleProvider } from '@/lib/LocaleContext'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Korea Management System',
  description: 'Comprehensive management system for Korea operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={inter.className}>
        <LocaleProvider>
              <Header />
              {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
