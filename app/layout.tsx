import type { Metadata } from 'next'
import './globals.css'
import './styles/globals.css'
import { LocaleProvider } from '@/lib/LocaleContext'
import { SiteProvider } from '@/lib/SiteContext'

export const metadata: Metadata = {
  title: 'K Energy Save | ระบบบริหารจัดการ',
  description: 'ระบบบริหารจัดการครบวงจร - บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด | K Energy Save Co., Ltd.',
  icons: {
    icon: [
      { url: '/zera-logo.png', sizes: 'any' },
      { url: '/zera-logo.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/zera-logo.png',
    shortcut: '/zera-logo.png',
  },
  openGraph: {
    title: 'K Energy Save | ระบบบริหารจัดการ',
    description: 'ระบบบริหารจัดการครบวงจร - บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด',
    images: ['/k-energy-save-logo.jpg'],
    siteName: 'K Energy Save',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K Energy Save | ระบบบริหารจัดการ',
    description: 'ระบบบริหารจัดการครบวงจร - บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด',
    images: ['/k-energy-save-logo.jpg'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <link rel="icon" href="/zera-logo.png" sizes="any" />
        <link rel="icon" type="image/png" href="/zera-logo.png" />
      </head>
      <body>
        <SiteProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </SiteProvider>
      </body>
    </html>
  )
}
