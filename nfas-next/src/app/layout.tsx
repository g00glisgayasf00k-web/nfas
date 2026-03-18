import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'National Flatpack Assembly Service', template: '%s | NFAS' },
  description: 'Connect with trusted local flatpack assembly fitters across the UK.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
