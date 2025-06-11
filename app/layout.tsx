import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'joyverse',
  description: 'G435',
  generator: 'typescript'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
