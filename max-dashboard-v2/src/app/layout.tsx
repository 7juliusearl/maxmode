import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'MaxMode v2',
  description: 'Personal dashboard for productivity and research',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0d0f] text-[#e8e8e8]">
        <Navigation>{children}</Navigation>
      </body>
    </html>
  )
}
