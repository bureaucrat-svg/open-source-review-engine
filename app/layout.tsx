import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Review Engine — Command Center',
    template: '%s | Review Engine',
  },
  description:
    'Open-source E-commerce Review CRM — manage, moderate, and analyze customer reviews with a secure, RLS-backed API.',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  )
}
