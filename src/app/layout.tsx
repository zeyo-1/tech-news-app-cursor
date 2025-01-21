import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tech News App",
  description: "最新のテクノロジーニュースをお届けします",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SupabaseProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
