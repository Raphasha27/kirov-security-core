import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kirov Security Core',
  description: 'Advanced Security Operations Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
