/**
 * Root Layout Component
 * 
 * This is the main layout wrapper for all pages in Next.js App Router.
 * It includes global styles, fonts, and metadata.
 */

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Zyntel Feedback - Beautiful Feedback Forms',
  description: 'Create beautiful feedback forms in seconds. Get real-time responses and insights with Zyntel Feedback.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

