import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pumeco Fleet System',
  description: 'Fleet & Fuel Management for Pumeco Road Construction',
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
