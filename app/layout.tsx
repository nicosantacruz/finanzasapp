import type React from 'react'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { AuthProvider } from '@/contexts/auth-context'
import { CompanyProvider } from '@/contexts/company-context'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dashboard Financiero - Gestión Empresarial',
  description: 'Sistema de gestión financiera para múltiples empresas',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CompanyProvider>
              {children}
              <Toaster />
            </CompanyProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
