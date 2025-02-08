import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { Toaster } from '@/components/ui/toaster';
import { RootLayoutClient } from '@/components/layout/RootLayoutClient';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buzz Tech Now",
  description: "最新のテクノロジーニュースをAIが要約してお届けします",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SupabaseProvider>
          <RootLayoutClient>{children}</RootLayoutClient>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
