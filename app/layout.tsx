import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from './providers/query-provider'
import { ThemeProvider } from './providers/theme-provider'

import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Penni Finance',
  description: 'Penni on the web. A calm, finance-first dashboard experience.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster 
                closeButton
                position="bottom-center"
                toastOptions={{
                  classNames: {
                    toast: 'border border-[#1b2a21] bg-[#111916] text-[#f4f7f5]',
                    title: 'text-[14px] font-bold',
                    description: 'text-[#93a19a]',
                    success: 'border-[#1f3325] bg-[#121c16] text-[#41d6b2]',
                    error: 'border-[#311d22] bg-[#1d1518] text-[#ff8a94]',
                    warning: 'border-[#2a2412] bg-[#1f1b0f] text-[#ffd66b]',
                    info: 'border-[#1b2a21] bg-[#111916] text-[#f4f7f5]',
                    closeButton: '!bg-[#18221d] !border-[#202c26] !text-[#f4f7f5] hover:!bg-[#2a3a31] transition-colors',
                  }
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
