import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'VaultPOS — Smart Point of Sale',
  description: 'Professional SaaS POS system for modern businesses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
