
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaxFile Pro - Annual Tax Filing Made Simple',
  description: 'Streamlined annual tax filing web application for salaried employees. Complete your Form 1040 with ease.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={null}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
