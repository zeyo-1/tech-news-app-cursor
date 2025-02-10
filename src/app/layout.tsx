import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RootLayoutClient } from '@/components/layout/RootLayoutClient'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Buzz Tech Now',
  description: '最新のテクノロジーニュースをAIが要約してお届けします',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <RootLayoutClient>{children}</RootLayoutClient>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 