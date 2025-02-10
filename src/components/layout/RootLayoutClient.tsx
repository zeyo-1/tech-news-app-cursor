'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // 管理者ページの場合は通常のヘッダーとサイドバーを表示しない
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <Sidebar
          isExpanded={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main className={cn(
          'pt-14 transition-all duration-300',
          isSidebarOpen ? 'md:pl-64' : 'md:pl-[70px]'
        )}>
          <div className="container py-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
} 