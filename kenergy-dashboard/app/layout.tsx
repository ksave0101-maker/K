import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'K Energy Dashboard',
  description: 'K Energy Save Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
