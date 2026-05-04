import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'HW Vault — Hot Wheels Collector Portfolio',
  description: 'Build and share your Hot Wheels collection. Browse 50,000+ cars, create portfolios, and connect with collectors worldwide.',
  openGraph: {
    title: 'HW Vault',
    description: 'Build and share your Hot Wheels collection',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-hw-dark text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
